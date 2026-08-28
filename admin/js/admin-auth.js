/**
 * Reliance Infotech — Admin Authentication & Session Guard
 */
(function() {
  'use strict';

  var SESSION_KEY = 'RelianceAdmin_Session';
  var CREDENTIALS_KEY = 'RelianceAdmin_Credentials';

  // Default master credentials
  var defaultCreds = {
    username: 'admin',
    email: 'admin@relianceinfotech.com.np',
    password: 'admin',
    name: 'Sushil Poudel',
    role: 'System Administrator'
  };

  window.AdminAuth = {
    // Get stored credentials or defaults
    getCredentials: function() {
      try {
        var stored = localStorage.getItem(CREDENTIALS_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      return defaultCreds;
    },

    // Save updated credentials
    saveCredentials: function(creds) {
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
    },

    // Check if user is currently logged in
    isAuthenticated: function() {
      try {
        var session = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
        if (session) {
          var parsed = JSON.parse(session);
          if (parsed && parsed.loggedIn && (Date.now() - parsed.timestamp < 86400000)) {
            return parsed;
          }
        }
      } catch (e) {}
      return false;
    },

    // Authenticate login
    login: function(identifier, password, remember) {
      var creds = this.getCredentials();
      var id = identifier.trim().toLowerCase();
      
      var isUserMatch = (id === creds.username.toLowerCase() || id === creds.email.toLowerCase());
      var isPassMatch = (password === creds.password);

      if (isUserMatch && isPassMatch) {
        var sessionData = {
          loggedIn: true,
          username: creds.username,
          name: creds.name,
          role: creds.role,
          timestamp: Date.now()
        };
        if (remember) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        } else {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        }
        return { success: true, user: sessionData };
      }
      return { success: false, message: 'Invalid username or password. Please try again.' };
    },

    // Logout
    logout: function() {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
      window.location.href = '/admin/login.html';
    },

    // Guard page (redirect if unauthenticated)
    requireAuth: function() {
      if (!this.isAuthenticated()) {
        window.location.href = '/admin/login.html';
      }
    },

    // Guard login page (redirect to dashboard if already authenticated)
    redirectIfAuth: function() {
      if (this.isAuthenticated()) {
        window.location.href = '/admin/index.html';
      }
    }
  };
})();
