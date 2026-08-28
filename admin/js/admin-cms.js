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
  }

  // 1. Dashboard Stats
  function renderDashboardStats() {
    var a = currentData.analytics || {};
    document.getElementById('statSalesUnits').textContent = (a.totalSalesUnits || 1480).toLocaleString() + ' Units';
    document.getElementById('statTotalClients').textContent = (a.totalClients || 520).toLocaleString() + '+';
    document.getElementById('statOngoingProjects').textContent = (a.ongoingProjects || 38) + ' Active';
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

  // 8. Inquiries Inbox
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
        '<td style="max-width:320px; font-size:13px; color:#cbd5e1;">' + escapeHtml(inq.message) + '</td>' +
        '<td><div class="adm-table-actions">' +
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
      }
    },
    deleteInquiry: function(id) {
      if (confirm('Delete this inquiry?')) {
        currentData.inquiries = (currentData.inquiries || []).filter(function(x) { return x.id !== id; });
        saveData();
        renderInquiriesTable();
        renderDashboardStats();
      }
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
    }
  };

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
  });
})();
