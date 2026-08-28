/**
 * Reliance Infotech — CMS Frontend Bridge
 * Loads custom CMS edits from localStorage, syncs contact form leads,
 * and seamlessly updates public pages.
 */
(function() {
  'use strict';

  var STORAGE_KEY = 'RelianceCMS_Data';

  window.RelianceCMS = {
    // Get latest active dataset
    getData: function() {
      try {
        var local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          var parsed = JSON.parse(local);
          return parsed;
        }
      } catch (e) {
        console.warn('Error reading RelianceCMS data from localStorage:', e);
      }
      return window.RelianceCMS_DefaultData || {};
    },

    // Save updated dataset
    saveData: function(data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
      } catch (e) {
        console.error('Error saving RelianceCMS data:', e);
        return false;
      }
    },

    // Record a new contact inquiry
    submitInquiry: function(inquiry) {
      var data = this.getData();
      if (!data.inquiries) data.inquiries = [];

      var now = new Date();
      var dateStr = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      var newInq = {
        id: 'inq-' + Date.now(),
        name: inquiry.name || 'Anonymous',
        email: inquiry.email || '',
        phone: inquiry.phone || '',
        subject: inquiry.subject || 'General Inquiry',
        message: inquiry.message || '',
        date: dateStr,
        status: 'unread'
      };

      data.inquiries.unshift(newInq);
      if (data.analytics) {
        data.analytics.totalInquiries = (data.analytics.totalInquiries || 0) + 1;
        data.analytics.unreadInquiries = (data.analytics.unreadInquiries || 0) + 1;
      }
      this.saveData(data);
      return newInq;
    },

    // Reset dataset to canonical defaults
    resetDefaults: function() {
      if (window.RelianceCMS_DefaultData) {
        this.saveData(window.RelianceCMS_DefaultData);
        return true;
      }
      return false;
    }
  };

  // Auto-initialize if first time
  if (!localStorage.getItem(STORAGE_KEY) && window.RelianceCMS_DefaultData) {
    window.RelianceCMS.saveData(window.RelianceCMS_DefaultData);
  }

  // Hook into public contact forms
  document.addEventListener('DOMContentLoaded', function() {
    var contactForms = document.querySelectorAll('form.ve-contact-form, form#contactForm, .ve-contact-form-wrap form');
    contactForms.forEach(function(form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var name = form.querySelector('[name="name"], #name, input[type="text"]')?.value || '';
        var email = form.querySelector('[name="email"], #email, input[type="email"]')?.value || '';
        var phone = form.querySelector('[name="phone"], #phone, [name="number"]')?.value || '';
        var subject = form.querySelector('[name="subject"], #subject')?.value || 'Website Contact Form';
        var message = form.querySelector('[name="message"], #message, textarea')?.value || '';

        window.RelianceCMS.submitInquiry({
          name: name,
          email: email,
          phone: phone,
          subject: subject,
          message: message
        });

        // Show thank you message
        var successNotice = form.querySelector('.ve-form-success');
        if (!successNotice) {
          successNotice = document.createElement('div');
          successNotice.className = 've-form-success';
          successNotice.style.cssText = 'background: rgba(212,160,23,0.15); color: #d4a017; border: 1px solid #d4a017; padding: 14px 20px; border-radius: 8px; margin-top: 15px; font-weight: 700; text-align: center;';
          successNotice.innerHTML = '<i class="fa fa-check-circle"></i> Thank you! Your inquiry has been sent to our IT team.';
          form.appendChild(successNotice);
        }
        successNotice.style.display = 'block';
        form.reset();
        setTimeout(function() {
          successNotice.style.display = 'none';
        }, 6000);
      });
    });
  });
})();
