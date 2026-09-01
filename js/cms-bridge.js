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

    // Save updated dataset (local + cloud)
    saveData: function(data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        
        // Asynchronously sync entire CMS state to Firebase Cloud Firestore
        if (window.RelianceFirebase && typeof window.RelianceFirebase.saveCMSData === 'function') {
          window.RelianceFirebase.saveCMSData(data).catch(function() {});
        }
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

      // Asynchronously sync to Cloud Firebase if available
      if (window.RelianceFirebase && typeof window.RelianceFirebase.saveInquiry === 'function') {
        window.RelianceFirebase.saveInquiry(newInq).catch(function() {});
      }

      return newInq;
    },

    // Reset dataset to canonical defaults
    resetDefaults: function() {
      if (window.RelianceCMS_DefaultData) {
        this.saveData(window.RelianceCMS_DefaultData);
        return true;
      }
      return false;
    },

    // Hydrate public website pages with live CMS data
    renderPublicContent: function(data) {
      if (!data) data = this.getData();

      // 1. Update Contact / Settings Info across header, footer & contact cards
      if (data.settings) {
        var s = data.settings;
        // Phone numbers
        if (s.phone1 || s.phone2) {
          var phoneStr = [s.phone1, s.phone2].filter(Boolean).join(' / ');
          document.querySelectorAll('.ve-phone-target, a[href^="tel:"]').forEach(function(el) {
            if (s.phone1 && el.getAttribute('href')?.startsWith('tel:')) {
              el.setAttribute('href', 'tel:' + s.phone1.replace(/[^0-9+]/g, ''));
            }
          });
        }
        // Official Email
        if (s.email) {
          document.querySelectorAll('.ve-email-target, a[href^="mailto:"]').forEach(function(el) {
            if (!el.classList.contains('no-cms')) {
              el.setAttribute('href', 'mailto:' + s.email);
              if (el.textContent.includes('@')) el.textContent = s.email;
            }
          });
        }
      }

      // 2. Update Hero Section on Homepage
      if (data.hero && document.querySelector('.ve-hero-title, .hero-area')) {
        var hero = data.hero;
        var hTitle = document.querySelector('.ve-hero-title h1, .hero-content h2, .ve-hero-heading');
        if (hTitle && hero.title) {
          hTitle.innerHTML = hero.title;
        }
        var hSubtitle = document.querySelector('.ve-hero-sub, .hero-content p, .ve-hero-p');
        if (hSubtitle && hero.subtitle) {
          hSubtitle.textContent = hero.subtitle;
        }
      }
    }
  };

  // Auto-initialize if first time
  if (!localStorage.getItem(STORAGE_KEY) && window.RelianceCMS_DefaultData) {
    window.RelianceCMS.saveData(window.RelianceCMS_DefaultData);
  }

  // Sync latest CMS data from Cloud Firestore on page load
  if (window.RelianceFirebase && typeof window.RelianceFirebase.fetchCMSData === 'function') {
    window.RelianceFirebase.fetchCMSData().then(function(cloudData) {
      if (cloudData && cloudData.hero) {
        var local = window.RelianceCMS.getData();
        var merged = Object.assign({}, local, cloudData);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch(e) {}
        window.RelianceCMS.renderPublicContent(merged);
      }
    }).catch(function() {});
  }

  // Hook into public contact forms & render dynamic content
  document.addEventListener('DOMContentLoaded', function() {
    window.RelianceCMS.renderPublicContent();

    var contactForms = document.querySelectorAll('form.ve-contact-form, form#contactForm, .ve-contact-form-wrap form');
    contactForms.forEach(function(form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var name = (form.querySelector('[name="name"], #name, input[type="text"]')?.value || '').trim();
        var email = (form.querySelector('[name="email"], #email, input[type="email"]')?.value || '').trim();
        var phone = (form.querySelector('[name="phone"], #phone, input[type="tel"], [name="number"]')?.value || '').trim();
        var subject = (form.querySelector('[name="subject"], #subject, select')?.value || 'Website Inquiry').trim();
        var message = (form.querySelector('[name="message"], #message, textarea')?.value || '').trim();

        window.RelianceCMS.submitInquiry({
          name: name || 'Website Visitor',
          email: email,
          phone: phone,
          subject: subject || 'General IT Inquiry',
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
