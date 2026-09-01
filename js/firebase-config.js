/**
 * Reliance Infotech — Firebase Configuration & Cloud Sync Module
 * Safely initializes Firebase Firestore with offline fallback & zero console errors.
 */
(function() {
  'use strict';

  var STORAGE_CONFIG_KEY = 'Reliance_Firebase_Config';

  // Default Firebase configuration for Reliance Infotech
  // Admin can also override or update these credentials from the Admin Portal Settings.
  var DEFAULT_CONFIG = {
    apiKey: "AIzaSyRelianceInfotechClientConfigKey2026",
    authDomain: "reliance-infotech-it.firebaseapp.com",
    projectId: "reliance-infotech-it",
    storageBucket: "reliance-infotech-it.appspot.com",
    messagingSenderId: "847291038291",
    appId: "1:847291038291:web:9f8a7b6c5d4e3f2a1b"
  };

  // Retrieve saved config or default
  function getConfig() {
    try {
      var saved = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        if (parsed && parsed.projectId) return parsed;
      }
    } catch (e) {
      // safe fallback
    }
    return DEFAULT_CONFIG;
  }

  // Global RelianceFirebase Interface
  window.RelianceFirebase = {
    isReady: false,
    app: null,
    db: null,
    projectId: 'reliance-infotech-it',
    listeners: [],

    // Initialize Firebase gracefully
    init: function() {
      if (this.isReady) return true;

      // Check if Firebase Compat SDK is present
      if (typeof firebase === 'undefined') {
        return false;
      }

      try {
        var config = getConfig();
        this.projectId = config.projectId || 'reliance-infotech-it';

        if (!firebase.apps || !firebase.apps.length) {
          this.app = firebase.initializeApp(config);
        } else {
          this.app = firebase.app();
        }

        if (firebase.firestore) {
          this.db = firebase.firestore();
          this.isReady = true;
          return true;
        }
      } catch (err) {
        // Log gently without crashing user experience
        console.info('[Reliance Infotech] Operating with Local Storage sync mode.');
        this.isReady = false;
      }
      return false;
    },

    // Save custom configuration from Admin
    saveConfig: function(newConfig) {
      try {
        localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(newConfig));
        return true;
      } catch (e) {
        return false;
      }
    },

    getConfig: getConfig,

    // Add Inquiry to Cloud Firestore
    saveInquiry: function(inquiryData) {
      var self = this;
      return new Promise(function(resolve) {
        if (!self.isReady || !self.db) {
          resolve({ success: false, mode: 'local' });
          return;
        }

        try {
          var payload = Object.assign({}, inquiryData, {
            createdAt: firebase.firestore.FieldValue ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString(),
            source: 'website_contact_form'
          });

          var docRef = inquiryData.id ? self.db.collection('inquiries').doc(inquiryData.id) : self.db.collection('inquiries').doc();
          docRef.set(payload, { merge: true })
            .then(function() {
              resolve({ success: true, id: docRef.id });
            })
            .catch(function(e) {
              resolve({ success: false, mode: 'local_fallback', error: e });
            });
        } catch (e) {
          resolve({ success: false, mode: 'local_fallback', error: e });
        }
      });
    },

    // Delete Inquiry from Cloud Firestore
    deleteInquiry: function(inquiryId) {
      var self = this;
      return new Promise(function(resolve) {
        if (!self.isReady || !self.db || !inquiryId) {
          resolve({ success: true, mode: 'local' });
          return;
        }
        try {
          self.db.collection('inquiries').doc(inquiryId).delete()
            .then(function() { resolve({ success: true }); })
            .catch(function() { resolve({ success: false }); });
        } catch (e) {
          resolve({ success: false });
        }
      });
    },

    // Update Inquiry status in Firestore
    updateInquiryStatus: function(inquiryId, status) {
      var self = this;
      return new Promise(function(resolve) {
        if (!self.isReady || !self.db || !inquiryId) {
          resolve({ success: true, mode: 'local' });
          return;
        }
        try {
          self.db.collection('inquiries').doc(inquiryId).update({
            status: status
          })
          .then(function() { resolve({ success: true }); })
          .catch(function() { resolve({ success: false }); });
        } catch (e) {
          resolve({ success: false });
        }
      });
    },

    // Save Entire Website CMS Dataset (Hero, Services, Insights, Team, Reviews, Logos, Settings)
    saveCMSData: function(data) {
      var self = this;
      return new Promise(function(resolve) {
        if (!self.isReady || !self.db) {
          resolve({ success: false, mode: 'local' });
          return;
        }
        try {
          // Exclude large transient inquiries from the static site content document
          var payload = Object.assign({}, data);
          delete payload.inquiries; // Stored separately in inquiries collection for optimal performance
          payload.updatedAt = firebase.firestore.FieldValue ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString();

          self.db.collection('cms_content').doc('site_data').set(payload, { merge: true })
            .then(function() { resolve({ success: true }); })
            .catch(function(e) { resolve({ success: false, error: e }); });
        } catch (e) {
          resolve({ success: false, error: e });
        }
      });
    },

    // Fetch Latest CMS Content from Cloud Firestore
    fetchCMSData: function() {
      var self = this;
      return new Promise(function(resolve) {
        if (!self.isReady || !self.db) {
          resolve(null);
          return;
        }
        try {
          self.db.collection('cms_content').doc('site_data').get()
            .then(function(doc) {
              if (doc.exists) {
                resolve(doc.data());
              } else {
                resolve(null);
              }
            })
            .catch(function() { resolve(null); });
        } catch (e) {
          resolve(null);
        }
      });
    },

    // Real-time listener for CMS Website content updates across all devices
    listenToCMSData: function(callback) {
      if (!this.isReady || !this.db) return null;
      try {
        var unsubscribe = this.db.collection('cms_content').doc('site_data')
          .onSnapshot(function(doc) {
            if (doc.exists) {
              callback(doc.data());
            }
          }, function() {});
        return unsubscribe;
      } catch (e) {
        return null;
      }
    },

    // Listen for Realtime Inquiries in Admin
    listenToInquiries: function(callback) {
      if (!this.isReady || !this.db) return null;
      try {
        var unsubscribe = this.db.collection('inquiries')
          .onSnapshot(function(snapshot) {
            var items = [];
            snapshot.forEach(function(doc) {
              var data = doc.data();
              data.id = doc.id;
              items.push(data);
            });
            // Sort by date descending
            items.sort(function(a, b) {
              var tA = a.date || '';
              var tB = b.date || '';
              return tB.localeCompare(tA);
            });
            callback(items);
          }, function(err) {
            // Silently fallback without breaking UI
          });
        return unsubscribe;
      } catch (e) {
        return null;
      }
    }
  };

  // Attempt initial safe boot
  if (typeof firebase !== 'undefined') {
    window.RelianceFirebase.init();
  }
})();
