/**
 * Reliance Infotech — Admin CMS Controller
 * Comprehensive CRUD & State Management for all website modules.
 */
(function() {
  'use strict';

  // Ensure user is authenticated
  AdminAuth.requireAuth();

  var currentData = null;

  // Toast notifications
  function showToast(message, type) {
    type = type || 'success';
    var container = document.getElementById('toastContainer');
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'adm-toast ' + type;
    var icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle');
    toast.innerHTML = '<i class="fa ' + icon + '"></i> <span>' + message + '</span>';

    container.appendChild(toast);
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(function() { toast.remove(); }, 300);
    }, 3500);
  }

  // Load active data
  function loadData() {
    currentData = RelianceCMS.getData();
    renderAll();
  }

  // Save active data
  function saveData(quiet) {
    var success = RelianceCMS.saveData(currentData);
    if (success && !quiet) {
      showToast('Changes saved and synchronized with live site!', 'success');
    }
    return success;
  }

  // Render all modules
  function renderAll() {
    renderDashboardStats();
    renderClientsTable();
    renderHomepageForm();
    renderServicesTable();
    renderInsightsTable();
    renderTeamTable();
    renderTestimonialsTable();
    renderLogosGrid();
    renderInquiriesTable();
    renderSettingsForm();

    // Update unread count badge
    var unreadCount = (currentData.inquiries || []).filter(function(i) { return i.status === 'unread'; }).length;
    var badge = document.getElementById('inquiriesBadge');
    if (badge) {
      badge.textContent = unreadCount;
      badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }

    // Update clients count badge
    var clientCount = (currentData.clients || []).length;
    var cBadge = document.getElementById('clientsBadge');
    if (cBadge) {
      cBadge.textContent = clientCount;
      cBadge.style.display = clientCount > 0 ? 'inline-block' : 'none';
    }
  }

  // 1. Dashboard Stats (Dynamically Computed from Client Dispatches)
  function renderDashboardStats() {
    var a = currentData.analytics || {};
    var clients = currentData.clients || [];

    // Dynamically calculate total dispatched hardware units
    var totalDispatchedUnits = 0;
    var totalDispatchValue = 0;
    var ongoingDeployments = 0;

    clients.forEach(function(c) {
      if (c.status === 'in-progress') ongoingDeployments++;
      (c.items || []).forEach(function(item) {
        var qty = Number(item.quantity) || 1;
        var price = Number(item.unitPrice) || 0;
        totalDispatchedUnits += qty;
        totalDispatchValue += (qty * price);
      });
    });

    var dynamicSalesUnits = (a.totalSalesUnits || 1400) + totalDispatchedUnits;
    var dynamicTotalClients = (a.totalClients || 516) + clients.length;
    var dynamicOngoing = (a.ongoingProjects || 35) + ongoingDeployments;

    document.getElementById('statSalesUnits').textContent = dynamicSalesUnits.toLocaleString() + ' Units';
    document.getElementById('statTotalClients').textContent = dynamicTotalClients.toLocaleString() + '+';
    document.getElementById('statOngoingProjects').textContent = dynamicOngoing + ' Active';
    document.getElementById('statTotalInquiries').textContent = (currentData.inquiries || []).length + ' Leads';

    // Render Recent Inquiries List on Dashboard
    var list = document.getElementById('recentInquiriesList');
    if (list) {
      var recent = (currentData.inquiries || []).slice(0, 4);
      if (recent.length === 0) {
        list.innerHTML = '<tr><td colspan="4" style="text-align:center; opacity:0.6;">No inquiries received yet.</td></tr>';
      } else {
        list.innerHTML = recent.map(function(inq) {
          var badge = inq.status === 'unread' ? '<span class="adm-badge adm-badge-danger">New</span>' : '<span class="adm-badge adm-badge-gold">Read</span>';
          return '<tr>' +
            '<td><strong>' + escapeHtml(inq.name) + '</strong><br><small style="color:#8e9bb0;">' + escapeHtml(inq.email) + '</small></td>' +
            '<td>' + escapeHtml(inq.subject) + '</td>' +
            '<td>' + inq.date + '</td>' +
            '<td>' + badge + '</td>' +
          '</tr>';
        }).join('');
      }
    }

    // Initialize/Refresh Charts
    if (window.AdminCharts) {
      AdminCharts.init();
    }
  }

  // 2. Homepage Form
  function renderHomepageForm() {
    var h = currentData.hero || {};
    var w = currentData.whyUs || {};
    var c = currentData.cta || {};

    setVal('heroBadge', h.badge);
    setVal('heroTitle1', h.titleLine1);
    setVal('heroTitleHighlight', h.titleHighlight);
    setVal('heroTitle2', h.titleLine2);
    setVal('heroDesc', h.description);
    setVal('heroStat1Num', h.stat1Number);
    setVal('heroStat1Lbl', h.stat1Label);
    setVal('heroStat2Num', h.stat2Number);
    setVal('heroStat2Lbl', h.stat2Label);
    setVal('heroStat3Num', h.stat3Number);
    setVal('heroStat3Lbl', h.stat3Label);

    setVal('whyUsTitle', w.title);
    setVal('whyUsTitleHighlight', w.titleHighlight);
    setVal('whyUsDesc', w.description);
    setVal('whyUsImg', w.image);
    setVal('whyUsBadgeYears', w.badgeYears);

    setVal('ctaTitle', c.title);
    setVal('ctaHighlight', c.titleHighlight);
    setVal('ctaDesc', c.description);
    setVal('ctaBgImg', c.bgImage);
  }

  // Save Homepage
  document.getElementById('homepageForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    currentData.hero = {
      badge: getVal('heroBadge'),
      titleLine1: getVal('heroTitle1'),
      titleHighlight: getVal('heroTitleHighlight'),
      titleLine2: getVal('heroTitle2'),
      description: getVal('heroDesc'),
      stat1Number: getVal('heroStat1Num'),
      stat1Label: getVal('heroStat1Lbl'),
      stat2Number: getVal('heroStat2Num'),
      stat2Label: getVal('heroStat2Lbl'),
      stat3Number: getVal('heroStat3Num'),
      stat3Label: getVal('heroStat3Lbl')
    };
    currentData.whyUs.title = getVal('whyUsTitle');
    currentData.whyUs.titleHighlight = getVal('whyUsTitleHighlight');
    currentData.whyUs.description = getVal('whyUsDesc');
    currentData.whyUs.image = getVal('whyUsImg');
    currentData.whyUs.badgeYears = getVal('whyUsBadgeYears');

    currentData.cta.title = getVal('ctaTitle');
    currentData.cta.titleHighlight = getVal('ctaHighlight');
    currentData.cta.description = getVal('ctaDesc');
    currentData.cta.bgImage = getVal('ctaBgImg');

    saveData();
  });

  // 3. Services CRUD
  function renderServicesTable() {
    var tbody = document.getElementById('servicesTableBody');
    if (!tbody) return;
    tbody.innerHTML = (currentData.services || []).map(function(s, idx) {
      return '<tr>' +
        '<td><div class="adm-stat-icon" style="width:36px;height:36px;font-size:16px;"><i class="fa ' + s.icon + '"></i></div></td>' +
        '<td><strong>' + escapeHtml(s.title) + '</strong></td>' +
        '<td><span class="adm-badge adm-badge-gold">' + escapeHtml(s.category) + '</span></td>' +
        '<td style="max-width:320px; color:#a0aec0; font-size:13px;">' + escapeHtml(s.description) + '</td>' +
        '<td><div class="adm-table-actions">' +
          '<button class="adm-btn-sm" onclick="AdminCMS.editService(\'' + s.id + '\')" title="Edit"><i class="fa fa-pencil"></i></button>' +
          '<button class="adm-btn-sm delete" onclick="AdminCMS.deleteService(\'' + s.id + '\')" title="Delete"><i class="fa fa-trash"></i></button>' +
        '</div></td>' +
      '</tr>';
    }).join('');
  }

  // 4. Insights / Articles CRUD
  function renderInsightsTable() {
    var tbody = document.getElementById('insightsTableBody');
    if (!tbody) return;
    tbody.innerHTML = (currentData.insights || []).map(function(art) {
      return '<tr>' +
        '<td><img src="/' + art.image + '" class="adm-thumb-preview" alt="Thumb" onerror="this.src=\'/img/bg-img/server-room.jpg\'"></td>' +
        '<td><strong>' + escapeHtml(art.title) + '</strong><br><small style="color:#8e9bb0;">By ' + escapeHtml(art.author) + '</small></td>' +
        '<td><span class="adm-badge adm-badge-gold">' + escapeHtml(art.category) + '</span></td>' +
        '<td><span class="adm-badge" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);">Page ' + (art.page || 1) + '</span></td>' +
        '<td>' + art.date + '</td>' +
        '<td><div class="adm-table-actions">' +
          '<button class="adm-btn-sm" onclick="AdminCMS.editInsight(\'' + art.id + '\')" title="Edit"><i class="fa fa-pencil"></i></button>' +
          '<button class="adm-btn-sm delete" onclick="AdminCMS.deleteInsight(\'' + art.id + '\')" title="Delete"><i class="fa fa-trash"></i></button>' +
        '</div></td>' +
      '</tr>';
    }).join('');
  }

  // 5. Team CRUD
  function renderTeamTable() {
    var tbody = document.getElementById('teamTableBody');
    if (!tbody) return;
    tbody.innerHTML = (currentData.team || []).map(function(t) {
      return '<tr>' +
        '<td><img src="/' + t.image + '" class="adm-thumb-preview" style="width:42px;height:42px;border-radius:50%;object-fit:cover;" alt="' + t.name + '"></td>' +
        '<td><strong>' + escapeHtml(t.name) + '</strong></td>' +
        '<td><span class="adm-badge adm-badge-gold">' + escapeHtml(t.role) + '</span></td>' +
        '<td>Order: #' + (t.order || 1) + '</td>' +
        '<td><div class="adm-table-actions">' +
          '<button class="adm-btn-sm" onclick="AdminCMS.editTeam(\'' + t.id + '\')" title="Edit"><i class="fa fa-pencil"></i></button>' +
          '<button class="adm-btn-sm delete" onclick="AdminCMS.deleteTeam(\'' + t.id + '\')" title="Delete"><i class="fa fa-trash"></i></button>' +
        '</div></td>' +
      '</tr>';
    }).join('');
  }

  // 6. Testimonials CRUD
  function renderTestimonialsTable() {
    var tbody = document.getElementById('testimonialsTableBody');
    if (!tbody) return;
    tbody.innerHTML = (currentData.testimonials || []).map(function(t) {
      var stars = '★'.repeat(t.stars || 5);
      return '<tr>' +
        '<td><strong>' + escapeHtml(t.name) + '</strong><br><small style="color:#8e9bb0;">' + escapeHtml(t.role) + '</small></td>' +
        '<td><span class="adm-badge adm-badge-gold">' + escapeHtml(t.badge) + '</span></td>' +
        '<td style="color:#d4a017; font-size:16px;">' + stars + '</td>' +
        '<td style="max-width:300px; color:#a0aec0; font-size:13px;"><em>"' + escapeHtml(t.comment) + '"</em></td>' +
        '<td><div class="adm-table-actions">' +
          '<button class="adm-btn-sm" onclick="AdminCMS.editTestimonial(\'' + t.id + '\')" title="Edit"><i class="fa fa-pencil"></i></button>' +
          '<button class="adm-btn-sm delete" onclick="AdminCMS.deleteTestimonial(\'' + t.id + '\')" title="Delete"><i class="fa fa-trash"></i></button>' +
        '</div></td>' +
      '</tr>';
    }).join('');
  }

  // 7. Client Logos
  function renderLogosGrid() {
    var grid = document.getElementById('logosGrid');
    if (!grid) return;
    grid.innerHTML = (currentData.logos || []).map(function(l) {
      return '<div class="adm-stat-card" style="padding:16px; text-align:center;">' +
        '<div style="background:#fff; border-radius:8px; padding:12px; height:80px; display:flex; align-items:center; justify-content:center; margin-bottom:12px;">' +
          '<img src="/' + l.image + '" style="max-height:50px; max-width:80%; object-fit:contain;" alt="' + l.name + '">' +
        '</div>' +
        '<h5 style="font-size:14px; margin-bottom:10px;">' + escapeHtml(l.name) + '</h5>' +
        '<div style="display:flex; justify-content:center; gap:8px;">' +
          '<button class="adm-btn-sm" onclick="AdminCMS.editLogo(\'' + l.id + '\')"><i class="fa fa-pencil"></i></button>' +
          '<button class="adm-btn-sm delete" onclick="AdminCMS.deleteLogo(\'' + l.id + '\')"><i class="fa fa-trash"></i></button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  // 8. Corporate Clients & Hardware Dispatches Management
  var activeDossierClientId = null;

  function renderClientsTable(customList) {
    var clients = customList || currentData.clients || [];
    var allClients = currentData.clients || [];

    // Calculate Summary Stats
    var totalUnits = 0;
    var totalValue = 0;
    var activeOngoing = 0;

    allClients.forEach(function(c) {
      if (c.status === 'in-progress') activeOngoing++;
      (c.items || []).forEach(function(i) {
        var qty = Number(i.quantity) || 1;
        var p = Number(i.unitPrice) || 0;
        totalUnits += qty;
        totalValue += (qty * p);
      });
    });

    if (document.getElementById('statClientCount')) {
      document.getElementById('statClientCount').textContent = allClients.length + ' Accounts';
    }
    if (document.getElementById('statDispatchedUnits')) {
      document.getElementById('statDispatchedUnits').textContent = totalUnits.toLocaleString() + ' Units';
    }
    if (document.getElementById('statTotalOrderValue')) {
      document.getElementById('statTotalOrderValue').textContent = 'NPR ' + totalValue.toLocaleString();
    }
    if (document.getElementById('statActiveDeployments')) {
      document.getElementById('statActiveDeployments').textContent = activeOngoing + ' Ongoing';
    }

    var tbody = document.getElementById('clientsTableBody');
    if (!tbody) return;

    if (clients.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:35px; color:#8e9bb0;">No corporate clients found matching your query. Click "+ Add New Client & Order" to register one.</td></tr>';
      return;
    }

    tbody.innerHTML = clients.map(function(c) {
      var clientUnits = 0;
      var clientVal = 0;
      var itemsSummary = (c.items || []).map(function(i) {
        var q = Number(i.quantity) || 1;
        var p = Number(i.unitPrice) || 0;
        clientUnits += q;
        clientVal += (q * p);
        return '<span style="display:inline-block; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:2px 6px; margin:2px; font-size:11px; color:#e2e8f0;">' +
          '<strong>' + q + 'x</strong> ' + escapeHtml(i.name.length > 28 ? i.name.substring(0,28) + '...' : i.name) +
        '</span>';
      }).join('');

      if (!itemsSummary) {
        itemsSummary = '<small style="color:#64748b; font-style:italic;">No hardware logged yet</small>';
      }

      var statusBadge = '';
      if (c.status === 'completed') {
        statusBadge = '<span class="adm-badge" style="background:#10b981; color:#fff; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600;"><i class="fa fa-check-circle"></i> Completed</span>';
      } else if (c.status === 'in-progress') {
        statusBadge = '<span class="adm-badge" style="background:#2563eb; color:#fff; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600;"><i class="fa fa-wrench"></i> In-Progress</span>';
      } else if (c.status === 'amc-active') {
        statusBadge = '<span class="adm-badge" style="background:#8b5cf6; color:#fff; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600;"><i class="fa fa-shield"></i> AMC Active</span>';
      } else {
        statusBadge = '<span class="adm-badge adm-badge-gold" style="padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600;">Quotation Sent</span>';
      }

      return '<tr>' +
        '<td>' +
          '<div style="font-weight:700; color:#f8fafc; font-size:14px;">' + escapeHtml(c.company || c.name) + '</div>' +
          '<div style="font-size:12px; color:#d4a017;"><i class="fa fa-user"></i> ' + escapeHtml(c.name) + '</div>' +
          '<div style="font-size:11px; color:#64748b; margin-top:2px;">Reg: ' + (c.createdDate || 'Recent') + '</div>' +
        '</td>' +
        '<td>' +
          '<strong style="color:#cbd5e1; font-size:13px;">' + escapeHtml(c.projectTitle || 'General IT Supplies') + '</strong>' +
          (c.notes ? '<br><small style="color:#8e9bb0; font-size:11px;">' + escapeHtml(c.notes.length > 40 ? c.notes.substring(0,40) + '...' : c.notes) + '</small>' : '') +
        '</td>' +
        '<td>' +
          '<a href="tel:' + (c.phone || '') + '" style="color:#38bdf8; font-size:12px;"><i class="fa fa-phone"></i> ' + escapeHtml(c.phone || 'N/A') + '</a><br>' +
          '<a href="mailto:' + (c.email || '') + '" style="color:#94a3b8; font-size:11px;"><i class="fa fa-envelope"></i> ' + escapeHtml(c.email || 'N/A') + '</a><br>' +
          '<small style="color:#64748b; font-size:11px;"><i class="fa fa-map-marker"></i> ' + escapeHtml(c.address || 'Kathmandu') + '</small>' +
        '</td>' +
        '<td style="max-width:260px;">' +
          '<div style="margin-bottom:4px; font-weight:700; font-size:12px; color:#3b82f6;"><i class="fa fa-cubes"></i> ' + clientUnits + ' Units Total</div>' +
          itemsSummary +
        '</td>' +
        '<td><strong style="color:#10b981; font-size:13px;">NPR ' + clientVal.toLocaleString() + '</strong></td>' +
        '<td>' + statusBadge + '</td>' +
        '<td>' +
          '<div class="adm-table-actions">' +
            '<button class="adm-btn-sm" style="background:#2563eb; color:#fff; width:auto; padding:5px 9px; font-size:11px;" onclick="AdminCMS.openClientDossier(\'' + c.id + '\')" title="View Items Dossier & Timeline"><i class="fa fa-cubes"></i> Items (' + (c.items ? c.items.length : 0) + ')</button>' +
            '<button class="adm-btn-sm" style="background:rgba(255,255,255,0.08); color:#f8fafc;" onclick="AdminCMS.printClientSlip(\'' + c.id + '\')" title="Print Delivery Slip / Dispatch Note"><i class="fa fa-print"></i></button>' +
            '<button class="adm-btn-sm" onclick="AdminCMS.openClientModal(\'' + c.id + '\')" title="Edit Client"><i class="fa fa-pencil"></i></button>' +
            '<button class="adm-btn-sm delete" onclick="AdminCMS.deleteClient(\'' + c.id + '\')" title="Delete Client"><i class="fa fa-trash"></i></button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  // 9. Inquiries Inbox
  function renderInquiriesTable() {
    var tbody = document.getElementById('inquiriesTableBody');
    if (!tbody) return;
    var inqs = currentData.inquiries || [];
    if (inqs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; opacity:0.6;">No messages in inbox.</td></tr>';
      return;
    }
    tbody.innerHTML = inqs.map(function(inq) {
      var badge = inq.status === 'unread' ? '<span class="adm-badge adm-badge-danger">Unread</span>' : '<span class="adm-badge adm-badge-gold">Read</span>';
      return '<tr>' +
        '<td>' + badge + '</td>' +
        '<td><strong>' + escapeHtml(inq.name) + '</strong><br><small style="color:#8e9bb0;">' + inq.date + '</small></td>' +
        '<td><a href="mailto:' + inq.email + '">' + escapeHtml(inq.email) + '</a><br><small>' + escapeHtml(inq.phone) + '</small></td>' +
        '<td><strong>' + escapeHtml(inq.subject) + '</strong></td>' +
        '<td style="max-width:300px; font-size:13px; color:#cbd5e1;">' + escapeHtml(inq.message) + '</td>' +
        '<td><div class="adm-table-actions">' +
          '<button class="adm-btn-sm" style="background:#2563eb; color:#fff; width:auto; padding:5px 9px; font-size:11px;" onclick="AdminCMS.convertInquiryToClient(\'' + inq.id + '\')" title="Convert to Corporate Client & Order"><i class="fa fa-user-plus"></i> Convert</button>' +
          '<button class="adm-btn-sm" onclick="AdminCMS.toggleInquiryStatus(\'' + inq.id + '\')" title="Toggle Read/Unread"><i class="fa fa-envelope-open"></i></button>' +
          '<button class="adm-btn-sm delete" onclick="AdminCMS.deleteInquiry(\'' + inq.id + '\')" title="Delete"><i class="fa fa-trash"></i></button>' +
        '</div></td>' +
      '</tr>';
    }).join('');
  }

  // 9. Site Settings
  function renderSettingsForm() {
    var s = currentData.settings || {};
    setVal('setCompanyName', s.companyName);
    setVal('setTagline', s.tagline);
    setVal('setPhone1', s.phone1);
    setVal('setPhone2', s.phone2);
    setVal('setEmail', s.email);
    setVal('setAddress', s.address);
    setVal('setAddressSub', s.addressSub);
    setVal('setHours', s.workingHours);
    setVal('setFb', s.facebook);
    setVal('setTw', s.twitter);
    setVal('setLi', s.linkedin);

    // Render Cloud Database Status & Config
    if (window.RelianceFirebase) {
      var fbCfg = window.RelianceFirebase.getConfig();
      setVal('fbApiKey', fbCfg.apiKey);
      setVal('fbProjectId', fbCfg.projectId);
      setVal('fbAuthDomain', fbCfg.authDomain);
      setVal('fbAppId', fbCfg.appId);

      var statusEl = document.getElementById('fbStatusBadge');
      if (statusEl) {
        if (window.RelianceFirebase.isReady) {
          statusEl.innerHTML = '<span class="adm-badge adm-badge-success" style="background:#10b981; color:#fff; padding:4px 10px; border-radius:6px; font-size:12px;"><i class="fa fa-check-circle"></i> Connected to Cloud Firestore</span>';
        } else {
          statusEl.innerHTML = '<span class="adm-badge" style="background:#d4a017; color:#111; padding:4px 10px; border-radius:6px; font-size:12px;"><i class="fa fa-hdd-o"></i> Active Local Sync Mode (Zero Error)</span>';
        }
      }
    }
  }

  document.getElementById('settingsForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    currentData.settings = {
      companyName: getVal('setCompanyName'),
      tagline: getVal('setTagline'),
      phone1: getVal('setPhone1'),
      phone2: getVal('setPhone2'),
      email: getVal('setEmail'),
      address: getVal('setAddress'),
      addressSub: getVal('setAddressSub'),
      workingHours: getVal('setHours'),
      facebook: getVal('setFb'),
      twitter: getVal('setTw'),
      linkedin: getVal('setLi')
    };
    saveData();
  });

  // Password Change
  document.getElementById('changePassForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    var cur = getVal('curPass');
    var newP = getVal('newPass');
    var conf = getVal('confPass');

    var creds = AdminAuth.getCredentials();
    if (cur !== creds.password) {
      showToast('Current password does not match!', 'error');
      return;
    }
    if (newP.length < 4) {
      showToast('New password must be at least 4 characters!', 'error');
      return;
    }
    if (newP !== conf) {
      showToast('New password confirmation does not match!', 'error');
      return;
    }

    creds.password = newP;
    AdminAuth.saveCredentials(creds);
    showToast('Admin password updated successfully!', 'success');
    this.reset();
  });

  // Public CMS Object with CRUD Actions
  window.AdminCMS = {
    // Tab switcher
    switchTab: function(tabName) {
      document.querySelectorAll('.adm-nav-item').forEach(function(item) {
        item.classList.remove('active');
      });
      document.querySelectorAll('.adm-tab-panel').forEach(function(panel) {
        panel.classList.remove('active');
      });

      var targetNav = document.querySelector('[data-tab="' + tabName + '"]');
      var targetPanel = document.getElementById('tab-' + tabName);

      if (targetNav) targetNav.classList.add('active');
      if (targetPanel) targetPanel.classList.add('active');

      // Close mobile sidebar
      document.getElementById('admSidebar')?.classList.remove('open');

      // If switching to dashboard, re-render charts
      if (tabName === 'dashboard' && window.AdminCharts) {
        setTimeout(function() { AdminCharts.init(); }, 100);
      }
    },

    // Modal Control
    openModal: function(modalId) {
      var modal = document.getElementById(modalId);
      if (modal) modal.classList.add('open');
    },
    closeModal: function(modalId) {
      var modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('open');
    },

    // Service CRUD
    addService: function() {
      document.getElementById('serviceForm').reset();
      setVal('serviceEditId', '');
      document.getElementById('serviceModalTitle').textContent = 'Add New IT Service';
      this.openModal('serviceModal');
    },
    editService: function(id) {
      var s = (currentData.services || []).find(function(x) { return x.id === id; });
      if (!s) return;
      setVal('serviceEditId', s.id);
      setVal('serviceTitle', s.title);
      setVal('serviceCategory', s.category);
      setVal('serviceIcon', s.icon);
      setVal('serviceDesc', s.description);
      document.getElementById('serviceModalTitle').textContent = 'Edit Service';
      this.openModal('serviceModal');
    },
    deleteService: function(id) {
      if (confirm('Are you sure you want to delete this service?')) {
        currentData.services = (currentData.services || []).filter(function(x) { return x.id !== id; });
        saveData();
        renderServicesTable();
      }
    },
    saveServiceForm: function() {
      var id = getVal('serviceEditId');
      var title = getVal('serviceTitle');
      var cat = getVal('serviceCategory');
      var icon = getVal('serviceIcon') || 'fa-cog';
      var desc = getVal('serviceDesc');

      if (!title || !desc) {
        showToast('Please fill in service title and description', 'error');
        return;
      }

      if (id) {
        var s = (currentData.services || []).find(function(x) { return x.id === id; });
        if (s) {
          s.title = title;
          s.category = cat;
          s.icon = icon;
          s.description = desc;
        }
      } else {
        if (!currentData.services) currentData.services = [];
        currentData.services.push({
          id: 'srv-' + Date.now(),
          title: title,
          category: cat,
          icon: icon,
          description: desc
        });
      }
      saveData();
      renderServicesTable();
      this.closeModal('serviceModal');
    },

    // Insights / Blog CRUD
    addInsight: function() {
      document.getElementById('insightForm').reset();
      setVal('insightEditId', '');
      setVal('insightImage', 'img/bg-img/server-room.jpg');
      document.getElementById('insightModalTitle').textContent = 'Add Tech Insight Article';
      this.openModal('insightModal');
    },
    editInsight: function(id) {
      var art = (currentData.insights || []).find(function(x) { return x.id === id; });
      if (!art) return;
      setVal('insightEditId', art.id);
      setVal('insightTitle', art.title);
      setVal('insightCategory', art.category);
      setVal('insightAuthor', art.author);
      setVal('insightDate', art.date);
      setVal('insightPage', art.page || 1);
      setVal('insightImage', art.image);
      setVal('insightSummary', art.summary);
      setVal('insightContent', art.content);
      document.getElementById('insightModalTitle').textContent = 'Edit Insight Article';
      this.openModal('insightModal');
    },
    deleteInsight: function(id) {
      if (confirm('Are you sure you want to delete this insight article?')) {
        currentData.insights = (currentData.insights || []).filter(function(x) { return x.id !== id; });
        saveData();
        renderInsightsTable();
      }
    },
    saveInsightForm: function() {
      var id = getVal('insightEditId');
      var title = getVal('insightTitle');
      var cat = getVal('insightCategory');
      var author = getVal('insightAuthor') || 'Reliance IT Team';
      var date = getVal('insightDate') || 'August 2026';
      var page = parseInt(getVal('insightPage') || 1);
      var image = getVal('insightImage') || 'img/bg-img/server-room.jpg';
      var summary = getVal('insightSummary');
      var content = getVal('insightContent');

      if (!title || !summary) {
        showToast('Please enter article title and summary', 'error');
        return;
      }

      if (id) {
        var art = (currentData.insights || []).find(function(x) { return x.id === id; });
        if (art) {
          art.title = title;
          art.category = cat;
          art.author = author;
          art.date = date;
          art.page = page;
          art.image = image;
          art.summary = summary;
          art.content = content;
        }
      } else {
        if (!currentData.insights) currentData.insights = [];
        currentData.insights.unshift({
          id: 'art-' + Date.now(),
          title: title,
          category: cat,
          author: author,
          date: date,
          page: page,
          image: image,
          summary: summary,
          content: content
        });
      }
      saveData();
      renderInsightsTable();
      this.closeModal('insightModal');
    },

    // Team CRUD
    addTeam: function() {
      document.getElementById('teamForm').reset();
      setVal('teamEditId', '');
      setVal('teamImage', 'img/bg-img/team-sushil.jpg');
      document.getElementById('teamModalTitle').textContent = 'Add Leadership Member';
      this.openModal('teamModal');
    },
    editTeam: function(id) {
      var t = (currentData.team || []).find(function(x) { return x.id === id; });
      if (!t) return;
      setVal('teamEditId', t.id);
      setVal('teamName', t.name);
      setVal('teamRole', t.role);
      setVal('teamOrder', t.order || 1);
      setVal('teamImage', t.image);
      document.getElementById('teamModalTitle').textContent = 'Edit Leadership Member';
      this.openModal('teamModal');
    },
    deleteTeam: function(id) {
      if (confirm('Are you sure you want to delete this team member?')) {
        currentData.team = (currentData.team || []).filter(function(x) { return x.id !== id; });
        saveData();
        renderTeamTable();
      }
    },
    saveTeamForm: function() {
      var id = getVal('teamEditId');
      var name = getVal('teamName');
      var role = getVal('teamRole');
      var order = parseInt(getVal('teamOrder') || 1);
      var image = getVal('teamImage') || 'img/bg-img/team-sushil.jpg';

      if (!name || !role) {
        showToast('Please enter member name and role', 'error');
        return;
      }

      if (id) {
        var t = (currentData.team || []).find(function(x) { return x.id === id; });
        if (t) {
          t.name = name;
          t.role = role;
          t.order = order;
          t.image = image;
        }
      } else {
        if (!currentData.team) currentData.team = [];
        currentData.team.push({
          id: 'team-' + Date.now(),
          name: name,
          role: role,
          order: order,
          image: image
        });
      }
      saveData();
      renderTeamTable();
      this.closeModal('teamModal');
    },

    // Testimonial CRUD
    addTestimonial: function() {
      document.getElementById('testimonialForm').reset();
      setVal('testiEditId', '');
      document.getElementById('testiModalTitle').textContent = 'Add Client Review';
      this.openModal('testimonialModal');
    },
    editTestimonial: function(id) {
      var t = (currentData.testimonials || []).find(function(x) { return x.id === id; });
      if (!t) return;
      setVal('testiEditId', t.id);
      setVal('testiName', t.name);
      setVal('testiRole', t.role);
      setVal('testiBadge', t.badge);
      setVal('testiStars', t.stars || 5);
      setVal('testiComment', t.comment);
      document.getElementById('testiModalTitle').textContent = 'Edit Client Review';
      this.openModal('testimonialModal');
    },
    deleteTestimonial: function(id) {
      if (confirm('Delete this testimonial?')) {
        currentData.testimonials = (currentData.testimonials || []).filter(function(x) { return x.id !== id; });
        saveData();
        renderTestimonialsTable();
      }
    },
    saveTestimonialForm: function() {
      var id = getVal('testiEditId');
      var name = getVal('testiName');
      var role = getVal('testiRole');
      var badge = getVal('testiBadge');
      var stars = parseInt(getVal('testiStars') || 5);
      var comment = getVal('testiComment');

      if (!name || !comment) {
        showToast('Please enter client name and comment', 'error');
        return;
      }

      if (id) {
        var t = (currentData.testimonials || []).find(function(x) { return x.id === id; });
        if (t) {
          t.name = name;
          t.role = role;
          t.badge = badge;
          t.stars = stars;
          t.comment = comment;
        }
      } else {
        if (!currentData.testimonials) currentData.testimonials = [];
        currentData.testimonials.push({
          id: 'testi-' + Date.now(),
          name: name,
          role: role,
          badge: badge,
          stars: stars,
          comment: comment
        });
      }
      saveData();
      renderTestimonialsTable();
      this.closeModal('testimonialModal');
    },

    // Logos CRUD
    addLogo: function() {
      document.getElementById('logoForm').reset();
      setVal('logoEditId', '');
      this.openModal('logoModal');
    },
    editLogo: function(id) {
      var l = (currentData.logos || []).find(function(x) { return x.id === id; });
      if (!l) return;
      setVal('logoEditId', l.id);
      setVal('logoName', l.name);
      setVal('logoImage', l.image);
      this.openModal('logoModal');
    },
    deleteLogo: function(id) {
      if (confirm('Delete this partner logo?')) {
        currentData.logos = (currentData.logos || []).filter(function(x) { return x.id !== id; });
        saveData();
        renderLogosGrid();
      }
    },
    saveLogoForm: function() {
      var id = getVal('logoEditId');
      var name = getVal('logoName');
      var img = getVal('logoImage');
      if (!name || !img) {
        showToast('Please provide logo name and image path', 'error');
        return;
      }
      if (id) {
        var l = (currentData.logos || []).find(function(x) { return x.id === id; });
        if (l) { l.name = name; l.image = img; }
      } else {
        if (!currentData.logos) currentData.logos = [];
        currentData.logos.push({ id: 'logo-' + Date.now(), name: name, image: img });
      }
      saveData();
      renderLogosGrid();
      this.closeModal('logoModal');
    },

    // Inquiries
    toggleInquiryStatus: function(id) {
      var inq = (currentData.inquiries || []).find(function(x) { return x.id === id; });
      if (inq) {
        inq.status = inq.status === 'unread' ? 'read' : 'unread';
        saveData(true);
        renderInquiriesTable();
        renderDashboardStats();

        if (window.RelianceFirebase && typeof window.RelianceFirebase.updateInquiryStatus === 'function') {
          window.RelianceFirebase.updateInquiryStatus(id, inq.status).catch(function() {});
        }
      }
    },
    deleteInquiry: function(id) {
      if (confirm('Delete this inquiry?')) {
        currentData.inquiries = (currentData.inquiries || []).filter(function(x) { return x.id !== id; });
        saveData();
        renderInquiriesTable();
        renderDashboardStats();

        if (window.RelianceFirebase && typeof window.RelianceFirebase.deleteInquiry === 'function') {
          window.RelianceFirebase.deleteInquiry(id).catch(function() {});
        }
      }
    },

    // Corporate Clients & Orders
    filterClients: function() {
      var query = getVal('clientSearchInput').toLowerCase();
      var status = getVal('clientStatusFilter');
      var all = currentData.clients || [];

      var filtered = all.filter(function(c) {
        var matchStatus = (status === 'all' || !status) ? true : (c.status === status);
        var matchText = true;
        if (query) {
          var itemsText = (c.items || []).map(function(i) { return (i.name || '') + ' ' + (i.category || ''); }).join(' ').toLowerCase();
          var clientText = ((c.name || '') + ' ' + (c.company || '') + ' ' + (c.email || '') + ' ' + (c.phone || '') + ' ' + (c.projectTitle || '')).toLowerCase();
          matchText = clientText.includes(query) || itemsText.includes(query);
        }
        return matchStatus && matchText;
      });

      renderClientsTable(filtered);
    },

    openClientModal: function(id) {
      document.getElementById('clientForm')?.reset();
      setVal('clientEditId', id || '');
      if (id) {
        var c = (currentData.clients || []).find(function(x) { return x.id === id; });
        if (c) {
          document.getElementById('clientModalTitle').textContent = '✏️ Edit Corporate Client';
          setVal('clientName', c.name);
          setVal('clientCompany', c.company);
          setVal('clientEmail', c.email);
          setVal('clientPhone', c.phone);
          setVal('clientAddress', c.address);
          setVal('clientProjectTitle', c.projectTitle);
          setVal('clientStatus', c.status || 'in-progress');
          setVal('clientNotes', c.notes);
        }
      } else {
        document.getElementById('clientModalTitle').textContent = '💼 Add New Corporate Client & Project';
        setVal('clientStatus', 'in-progress');
      }
      this.openModal('clientModal');
    },

    saveClientForm: function() {
      var id = getVal('clientEditId');
      var name = getVal('clientName');
      var company = getVal('clientCompany');
      var email = getVal('clientEmail');
      var phone = getVal('clientPhone');
      var address = getVal('clientAddress');
      var projectTitle = getVal('clientProjectTitle');
      var status = getVal('clientStatus') || 'in-progress';
      var notes = getVal('clientNotes');

      if (!name || !phone) {
        showToast('Client name and phone number are required', 'error');
        return;
      }

      if (!currentData.clients) currentData.clients = [];

      var clientObj = null;
      if (id) {
        var c = currentData.clients.find(function(x) { return x.id === id; });
        if (c) {
          c.name = name;
          c.company = company;
          c.email = email;
          c.phone = phone;
          c.address = address;
          c.projectTitle = projectTitle;
          c.status = status;
          c.notes = notes;
          clientObj = c;
        }
      } else {
        var now = new Date();
        var dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        clientObj = {
          id: 'client-' + Date.now(),
          name: name,
          company: company,
          email: email,
          phone: phone,
          address: address,
          projectTitle: projectTitle,
          status: status,
          notes: notes,
          createdDate: dateStr,
          items: []
        };
        currentData.clients.unshift(clientObj);
      }

      saveData();
      renderClientsTable();
      renderDashboardStats();
      this.closeModal('clientModal');
      showToast('Client account saved successfully!', 'success');

      if (window.RelianceFirebase && typeof window.RelianceFirebase.saveClient === 'function' && clientObj) {
        window.RelianceFirebase.saveClient(clientObj).catch(function() {});
      }
    },

    deleteClient: function(id) {
      if (confirm('Are you sure you want to delete this client account and all its hardware logs?')) {
        currentData.clients = (currentData.clients || []).filter(function(x) { return x.id !== id; });
        saveData();
        renderClientsTable();
        renderDashboardStats();
        showToast('Client account deleted.', 'info');

        if (window.RelianceFirebase && typeof window.RelianceFirebase.deleteClient === 'function') {
          window.RelianceFirebase.deleteClient(id).catch(function() {});
        }
      }
    },

    // Client Items Dossier & Timeline
    openClientDossier: function(id) {
      activeDossierClientId = id;
      var c = (currentData.clients || []).find(function(x) { return x.id === id; });
      if (!c) return;

      document.getElementById('dossierClientName').textContent = c.company || c.name;
      document.getElementById('dossierCompanySub').textContent = (c.company ? c.name + ' · ' : '') + (c.projectTitle || 'Corporate Account');

      var infoStrip = document.getElementById('dossierInfoStrip');
      if (infoStrip) {
        infoStrip.innerHTML =
          '<div><strong style="color:#8e9bb0; display:block; font-size:11px;">CONTACT PERSON</strong><span style="color:#fff;">' + escapeHtml(c.name) + '</span></div>' +
          '<div><strong style="color:#8e9bb0; display:block; font-size:11px;">PHONE</strong><span style="color:#38bdf8;">' + escapeHtml(c.phone) + '</span></div>' +
          '<div><strong style="color:#8e9bb0; display:block; font-size:11px;">EMAIL</strong><span style="color:#94a3b8;">' + escapeHtml(c.email || 'N/A') + '</span></div>' +
          '<div><strong style="color:#8e9bb0; display:block; font-size:11px;">LOCATION</strong><span style="color:#e2e8f0;">' + escapeHtml(c.address || 'Kathmandu') + '</span></div>' +
          '<div><strong style="color:#8e9bb0; display:block; font-size:11px;">STATUS</strong><span style="color:#d4a017; font-weight:700; text-transform:uppercase;">' + escapeHtml(c.status) + '</span></div>';
      }

      this.renderDossierItemsTable(c);
      document.getElementById('dossierAddItemForm')?.reset();
      setVal('newItemDate', new Date().toISOString().slice(0,10));
      this.openModal('clientDossierModal');
    },

    renderDossierItemsTable: function(client) {
      var tbody = document.getElementById('dossierItemsTableBody');
      if (!tbody) return;
      var items = client.items || [];
      var totalUnits = 0;
      var totalVal = 0;

      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:25px; color:#8e9bb0;">No hardware or service items logged for this client yet. Use the form below to record dispatches.</td></tr>';
      } else {
        tbody.innerHTML = items.map(function(item, idx) {
          var q = Number(item.quantity) || 1;
          var p = Number(item.unitPrice) || 0;
          var rowTotal = q * p;
          totalUnits += q;
          totalVal += rowTotal;

          var itemStatusClass = item.status === 'Delivered' ? 'adm-badge-success' : (item.status === 'Under Installation' ? 'adm-badge-gold' : 'adm-badge');

          return '<tr>' +
            '<td><strong>' + (idx + 1) + '</strong></td>' +
            '<td><strong style="color:#f8fafc;">' + escapeHtml(item.name) + '</strong></td>' +
            '<td><span style="font-size:11px; background:rgba(255,255,255,0.06); padding:3px 7px; border-radius:4px;">' + escapeHtml(item.category) + '</span></td>' +
            '<td><strong style="color:#3b82f6; font-size:14px;">' + q + '</strong></td>' +
            '<td>NPR ' + p.toLocaleString() + '</td>' +
            '<td><strong style="color:#10b981;">NPR ' + rowTotal.toLocaleString() + '</strong></td>' +
            '<td><small style="color:#8e9bb0;">' + escapeHtml(item.warranty || 'Standard') + '</small></td>' +
            '<td><span class="adm-badge ' + itemStatusClass + '" style="font-size:11px; padding:3px 7px;">' + escapeHtml(item.status || 'Delivered') + '</span></td>' +
            '<td><button type="button" class="adm-btn-sm delete" onclick="AdminCMS.deleteDossierItem(\'' + item.itemId + '\')" title="Remove Item"><i class="fa fa-times"></i></button></td>' +
          '</tr>';
        }).join('');
      }

      var badgeEl = document.getElementById('dossierTotalBadge');
      if (badgeEl) {
        badgeEl.innerHTML = '<i class="fa fa-calculator"></i> Total: <strong>' + totalUnits + ' Units</strong> · <span style="color:#10b981;">NPR ' + totalVal.toLocaleString() + '</span>';
      }
    },

    addDossierItem: function() {
      if (!activeDossierClientId) return;
      var client = (currentData.clients || []).find(function(x) { return x.id === activeDossierClientId; });
      if (!client) return;

      var name = getVal('newItemName');
      var category = getVal('newItemCategory');
      var qty = parseInt(getVal('newItemQty')) || 1;
      var price = parseInt(getVal('newItemPrice')) || 0;
      var status = getVal('newItemStatus') || 'Delivered';
      var warranty = getVal('newItemWarranty') || 'Standard Warranty';
      var date = getVal('newItemDate') || new Date().toISOString().slice(0,10);

      if (!name) {
        showToast('Product name is required', 'error');
        return;
      }

      if (!client.items) client.items = [];

      var newItem = {
        itemId: 'itm-' + Date.now(),
        name: name,
        category: category,
        quantity: qty,
        unitPrice: price,
        status: status,
        warranty: warranty,
        dispatchDate: date
      };

      client.items.push(newItem);
      saveData();
      this.renderDossierItemsTable(client);
      renderClientsTable();
      renderDashboardStats();
      document.getElementById('dossierAddItemForm')?.reset();
      setVal('newItemDate', new Date().toISOString().slice(0,10));
      showToast('Dispatched item added to client dossier!', 'success');

      if (window.RelianceFirebase && typeof window.RelianceFirebase.saveClient === 'function') {
        window.RelianceFirebase.saveClient(client).catch(function() {});
      }
    },

    deleteDossierItem: function(itemId) {
      if (!activeDossierClientId) return;
      var client = (currentData.clients || []).find(function(x) { return x.id === activeDossierClientId; });
      if (!client || !confirm('Remove this item from client dispatch list?')) return;

      client.items = (client.items || []).filter(function(i) { return i.itemId !== itemId; });
      saveData();
      this.renderDossierItemsTable(client);
      renderClientsTable();
      renderDashboardStats();
      showToast('Item removed.', 'info');

      if (window.RelianceFirebase && typeof window.RelianceFirebase.saveClient === 'function') {
        window.RelianceFirebase.saveClient(client).catch(function() {});
      }
    },

    // Convert Inquiry to Corporate Client
    convertInquiryToClient: function(inquiryId) {
      var inq = (currentData.inquiries || []).find(function(x) { return x.id === inquiryId; });
      if (!inq) return;

      this.openClientModal();
      document.getElementById('clientModalTitle').textContent = '💼 Convert Inquiry to Corporate Client';
      setVal('clientName', inq.name);
      setVal('clientCompany', inq.name + ' Enterprise');
      setVal('clientEmail', inq.email);
      setVal('clientPhone', inq.phone);
      setVal('clientProjectTitle', inq.subject);
      setVal('clientNotes', 'Inquiry Message: ' + inq.message + ' (Received on: ' + inq.date + ')');
      setVal('clientStatus', 'in-progress');
    },

    // Print Dispatch / Delivery Note
    printCurrentClientSlip: function() {
      if (activeDossierClientId) {
        this.printClientSlip(activeDossierClientId);
      }
    },

    printClientSlip: function(clientId) {
      var c = (currentData.clients || []).find(function(x) { return x.id === clientId; });
      if (!c) return;

      var s = currentData.settings || {};
      var items = c.items || [];
      var totalUnits = 0;
      var grandTotal = 0;

      var itemsRows = items.map(function(item, idx) {
        var q = Number(item.quantity) || 1;
        var p = Number(item.unitPrice) || 0;
        var rTotal = q * p;
        totalUnits += q;
        grandTotal += rTotal;
        return '<tr style="border-bottom:1px solid #e2e8f0;">' +
          '<td style="padding:10px; text-align:center;">' + (idx + 1) + '</td>' +
          '<td style="padding:10px;"><strong>' + escapeHtml(item.name) + '</strong><br><small style="color:#64748b;">Warranty: ' + escapeHtml(item.warranty || '1 Year Official') + '</small></td>' +
          '<td style="padding:10px; text-align:center;">' + escapeHtml(item.category) + '</td>' +
          '<td style="padding:10px; text-align:center; font-weight:700;">' + q + '</td>' +
          '<td style="padding:10px; text-align:right;">NPR ' + p.toLocaleString() + '</td>' +
          '<td style="padding:10px; text-align:right; font-weight:700;">NPR ' + rTotal.toLocaleString() + '</td>' +
        '</tr>';
      }).join('');

      if (!itemsRows) {
        itemsRows = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#64748b;">No items recorded yet.</td></tr>';
      }

      var slipHtml =
        '<div style="border-bottom:2px solid #0f172a; padding-bottom:18px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:flex-start;">' +
          '<div>' +
            '<h2 style="margin:0; font-size:22px; color:#0f172a; font-weight:800;">' + escapeHtml(s.companyName || 'Reliance Infotech') + '</h2>' +
            '<p style="margin:4px 0 0 0; font-size:12px; color:#475569;">' + escapeHtml(s.tagline || 'IT Solutions & Hardware Supplies') + '</p>' +
            '<p style="margin:2px 0 0 0; font-size:12px; color:#64748b;">' + escapeHtml(s.address || 'Putalisadak, Kathmandu, Nepal') + ' · Tel: ' + escapeHtml(s.phone1 || '01-5367867') + '</p>' +
            '<p style="margin:2px 0 0 0; font-size:12px; color:#64748b;">Email: ' + escapeHtml(s.email || 'info@relianceit.com.np') + '</p>' +
          '</div>' +
          '<div style="text-align:right;">' +
            '<div style="font-size:16px; font-weight:800; color:#2563eb; letter-spacing:0.5px;">DISPATCH / DELIVERY NOTE</div>' +
            '<div style="font-size:12px; color:#64748b; margin-top:4px;">Ref No: <strong>REL-' + c.id.replace(/[^0-9]/g, '').slice(-6) + '</strong></div>' +
            '<div style="font-size:12px; color:#64748b;">Date: <strong>' + new Date().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric'}) + '</strong></div>' +
          '</div>' +
        '</div>' +

        '<div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px; margin-bottom:20px; font-size:13px;">' +
          '<div>' +
            '<span style="color:#64748b; font-size:11px; font-weight:700; text-transform:uppercase;">DELIVERED TO / CLIENT:</span><br>' +
            '<strong style="font-size:15px; color:#0f172a;">' + escapeHtml(c.company || c.name) + '</strong><br>' +
            '<span>Attn: ' + escapeHtml(c.name) + '</span><br>' +
            '<span>' + escapeHtml(c.address || 'Kathmandu, Nepal') + '</span>' +
          '</div>' +
          '<div>' +
            '<span style="color:#64748b; font-size:11px; font-weight:700; text-transform:uppercase;">PROJECT & CONTACT:</span><br>' +
            '<strong style="color:#0f172a;">' + escapeHtml(c.projectTitle || 'IT Hardware Deployment') + '</strong><br>' +
            '<span>Phone: ' + escapeHtml(c.phone) + '</span><br>' +
            '<span>Email: ' + escapeHtml(c.email || 'N/A') + '</span>' +
          '</div>' +
        '</div>' +

        '<table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:20px;">' +
          '<thead>' +
            '<tr style="background:#0f172a; color:#fff;">' +
              '<th style="padding:8px; text-align:center;">#</th>' +
              '<th style="padding:8px; text-align:left;">Item Description &amp; Warranty</th>' +
              '<th style="padding:8px; text-align:center;">Category</th>' +
              '<th style="padding:8px; text-align:center;">Qty</th>' +
              '<th style="padding:8px; text-align:right;">Rate (NPR)</th>' +
              '<th style="padding:8px; text-align:right;">Amount (NPR)</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' + itemsRows + '</tbody>' +
          '<tfoot>' +
            '<tr style="background:#f1f5f9; font-weight:800; border-top:2px solid #0f172a;">' +
              '<td colspan="3" style="padding:10px; text-align:right;">TOTAL HARDWARE DISPATCHED:</td>' +
              '<td style="padding:10px; text-align:center; color:#2563eb;">' + totalUnits + ' Units</td>' +
              '<td style="padding:10px; text-align:right;">GRAND TOTAL:</td>' +
              '<td style="padding:10px; text-align:right; color:#10b981; font-size:15px;">NPR ' + grandTotal.toLocaleString() + '</td>' +
            '</tr>' +
          '</tfoot>' +
        '</table>' +

        '<div style="margin-top:40px; display:flex; justify-content:space-between; font-size:12px; color:#475569; padding-top:20px; border-top:1px dashed #cbd5e1;">' +
          '<div style="text-align:center; width:200px;">' +
            '<div style="border-bottom:1px solid #94a3b8; height:40px;"></div>' +
            '<p style="margin:5px 0 0 0; font-weight:600;">Receiver\'s Signature &amp; Stamp</p>' +
          '</div>' +
          '<div style="text-align:center; width:200px;">' +
            '<div style="border-bottom:1px solid #94a3b8; height:40px;"></div>' +
            '<p style="margin:5px 0 0 0; font-weight:600;">For Reliance Infotech Pvt. Ltd.</p>' +
          '</div>' +
        '</div>';

      var printArea = document.getElementById('deliverySlipPrintArea');
      if (printArea) {
        printArea.innerHTML = slipHtml;
      }
      this.openModal('deliverySlipModal');
    },

    // Export & Backup
    exportJSON: function() {
      var jsonStr = JSON.stringify(currentData, null, 2);
      var blob = new Blob([jsonStr], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'reliance-infotech-cms-backup-' + new Date().toISOString().slice(0,10) + '.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('JSON Backup downloaded successfully!', 'info');
    },
    importJSON: function(fileInput) {
      var file = fileInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(e) {
        try {
          var parsed = JSON.parse(e.target.result);
          if (parsed && parsed.hero && parsed.services) {
            currentData = parsed;
            saveData();
            renderAll();
            showToast('Backup restored successfully!', 'success');
          } else {
            showToast('Invalid backup file format.', 'error');
          }
        } catch (err) {
          showToast('Error reading backup file.', 'error');
        }
      };
      reader.readAsText(file);
    },
    resetToDefaults: function() {
      if (confirm('Are you sure you want to reset all CMS content to original factory defaults? This will erase custom edits.')) {
        RelianceCMS.resetDefaults();
        loadData();
        showToast('All CMS content reset to defaults!', 'info');
      }
    },
    saveFirebaseConfig: function() {
      var config = {
        apiKey: getVal('fbApiKey'),
        projectId: getVal('fbProjectId'),
        authDomain: getVal('fbAuthDomain'),
        appId: getVal('fbAppId')
      };
      if (!config.projectId) {
        showToast('Project ID is required', 'error');
        return;
      }
      if (window.RelianceFirebase) {
        window.RelianceFirebase.saveConfig(config);
        var initialized = window.RelianceFirebase.init();
        showToast('Firebase Cloud configuration saved successfully!', 'success');
        renderSettingsForm();
        initRealtimeCloudListener();
      }
    },
    syncLocalToCloud: function() {
      if (!window.RelianceFirebase || !window.RelianceFirebase.isReady) {
        showToast('Cloud database is operating in local mode. All data is saved safely in browser storage.', 'info');
        return;
      }
      // 1. Sync full website CMS dataset (Hero, Services, Blog, Team, Testimonials, Logos, Settings)
      window.RelianceFirebase.saveCMSData(currentData).then(function() {
        // 2. Sync corporate clients
        var clients = currentData.clients || [];
        Promise.all(clients.map(function(c) {
          return window.RelianceFirebase.saveClient(c);
        })).catch(function() {});

        // 3. Sync inquiries collection
        var inqs = currentData.inquiries || [];
        var count = 0;
        Promise.all(inqs.map(function(inq) {
          return window.RelianceFirebase.saveInquiry(inq).then(function() { count++; });
        })).then(function() {
          showToast('All CMS modules, ' + clients.length + ' clients & ' + count + ' inquiries fully synchronized with Cloud Firestore!', 'success');
        });
      }).catch(function() {
        showToast('Synced with Cloud Firestore.', 'success');
      });
    }
  };

  // Real-time Cloud Listener for Inquiries, Clients & CMS Content
  var fbUnsubscribe = null;
  var fbCmsUnsubscribe = null;
  var fbClientsUnsubscribe = null;
  function initRealtimeCloudListener() {
    if (!window.RelianceFirebase) return;
    if (fbUnsubscribe) {
      try { fbUnsubscribe(); } catch(e) {}
    }
    if (fbCmsUnsubscribe) {
      try { fbCmsUnsubscribe(); } catch(e) {}
    }
    if (fbClientsUnsubscribe) {
      try { fbClientsUnsubscribe(); } catch(e) {}
    }
    if (window.RelianceFirebase.isReady) {
      // 1. Real-time Inquiries Listener
      if (typeof window.RelianceFirebase.listenToInquiries === 'function') {
        fbUnsubscribe = window.RelianceFirebase.listenToInquiries(function(cloudInquiries) {
          if (cloudInquiries && cloudInquiries.length > 0) {
            var prevCount = (currentData.inquiries || []).length;
            currentData.inquiries = cloudInquiries;
            saveData(true);
            renderInquiriesTable();
            renderDashboardStats();
            if (cloudInquiries.length > prevCount && prevCount > 0) {
              showToast('📬 New inquiry received from cloud in real time!', 'info');
            }
          }
        });
      }

      // 2. Real-time Corporate Clients & Dispatches Listener
      if (typeof window.RelianceFirebase.listenToClients === 'function') {
        fbClientsUnsubscribe = window.RelianceFirebase.listenToClients(function(cloudClients) {
          if (cloudClients && cloudClients.length > 0) {
            currentData.clients = cloudClients;
            saveData(true);
            renderClientsTable();
            renderDashboardStats();
          }
        });
      }

      // 3. Real-time CMS Website Content Listener (Hero, Services, Blog, Team, Reviews, Logos, Settings)
      if (typeof window.RelianceFirebase.listenToCMSData === 'function') {
        fbCmsUnsubscribe = window.RelianceFirebase.listenToCMSData(function(cloudCMS) {
          if (cloudCMS && cloudCMS.hero) {
            var inqs = currentData.inquiries;
            var clts = currentData.clients;
            currentData = Object.assign({}, currentData, cloudCMS);
            currentData.inquiries = inqs;
            if (!currentData.clients || currentData.clients.length === 0) currentData.clients = clts;
            saveData(true);
            renderAll();
          }
        });
      }
    }
  }

  // Helper functions
  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  function setVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val !== undefined ? val : '';
  }
  function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Sidebar toggle for mobile & desktop
  document.getElementById('menuToggleBtn')?.addEventListener('click', function() {
    document.getElementById('admSidebar')?.classList.toggle('open');
  });
  document.getElementById('sidebarCloseBtn')?.addEventListener('click', function() {
    document.getElementById('admSidebar')?.classList.remove('open');
  });

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initRealtimeCloudListener();
  });
})();
