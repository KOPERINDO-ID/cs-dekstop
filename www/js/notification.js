/**
 * ============================================================
 * NOTIFICATION MANAGER - COMPLETE FIXED VERSION
 * ============================================================
 * Perbaikan lengkap untuk integrasi Firebase Cloud Messaging
 * dengan Cordova + Framework7 v7 + Laravel 5 Backend
 * 
 * FIXES:
 * - Added missing initFirebase() implementation
 * - Added missing setupFirebaseListeners() implementation
 * - Added missing isFirebaseAvailable() public method
 * - Added missing getFirebaseToken() public method
 * - Fixed Firebase plugin detection
 * - Fixed permission handling
 * - Improved error handling
 * - Added comprehensive logging
 */

var NotificationManager = (function () {
    'use strict';

    // ========== PRIVATE VARIABLES ==========
    var state = {
        userId: null,
        fcmToken: null,
        notifications: [],
        unreadCount: 0,
        isInitialized: false,
        firebaseReady: false
    };

    var config = {
        apiUrl: typeof BASE_API !== 'undefined' ? BASE_API : '',
        storageKey: 'app_notifications',
        maxNotifications: 50,
        toastDuration: 5000,
        debugMode: true,
        soundEnabled: true,
        soundPath: 'audio/notification.mp3'
    };

    // ========== AUDIO FUNCTIONS ==========
    var notificationSound = null;

    function initNotificationSound() {
        try {
            notificationSound = new Audio(config.soundPath);
            notificationSound.volume = 1.0;
            log('🔊 Notification sound initialized');
        } catch (e) {
            log('❌ Failed to initialize notification sound:', e);
        }
    }

    function playNotificationSound() {
        if (!config.soundEnabled) {
            log('🔇 Sound disabled');
            return;
        }

        try {
            if (!notificationSound) {
                initNotificationSound();
            }

            if (notificationSound) {
                // Reset audio to beginning if already playing
                notificationSound.currentTime = 0;

                var playPromise = notificationSound.play();

                if (playPromise !== undefined) {
                    playPromise.then(function () {
                        log('🔊 Notification sound played');
                    }).catch(function (error) {
                        log('❌ Failed to play notification sound:', error);
                    });
                }
            }
        } catch (e) {
            log('❌ Error playing notification sound:', e);
        }
    }

    // ========== UTILITY FUNCTIONS ==========
    function log(message, data) {
        if (config.debugMode) {
            console.log('[NotificationManager] ' + message, data || '');
        }
    }

    function saveToStorage() {
        try {
            localStorage.setItem(config.storageKey, JSON.stringify(state.notifications));
            localStorage.setItem(config.storageKey + '_count', state.unreadCount);
        } catch (e) {
            log('Error saving to storage:', e);
        }
    }

    function loadFromStorage() {
        try {
            var stored = localStorage.getItem(config.storageKey);
            if (stored) {
                state.notifications = JSON.parse(stored);
            }
            var count = localStorage.getItem(config.storageKey + '_count');
            if (count) {
                state.unreadCount = parseInt(count) || 0;
            }
        } catch (e) {
            log('Error loading from storage:', e);
            state.notifications = [];
            state.unreadCount = 0;
        }
    }

    function updateBadge() {
        var badge = document.getElementById('notifBadge');
        if (badge) {
            if (state.unreadCount > 0) {
                badge.textContent = state.unreadCount > 99 ? '99+' : state.unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            var date = new Date(dateStr);
            var now = new Date();
            var diff = now - date;
            var seconds = Math.floor(diff / 1000);
            var minutes = Math.floor(seconds / 60);
            var hours = Math.floor(minutes / 60);
            var days = Math.floor(hours / 24);

            if (days > 7) {
                return date.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
            } else if (days > 0) {
                return days + ' hari lalu';
            } else if (hours > 0) {
                return hours + ' jam lalu';
            } else if (minutes > 0) {
                return minutes + ' menit lalu';
            } else {
                return 'Baru saja';
            }
        } catch (e) {
            return dateStr;
        }
    }

    // ========== API FUNCTIONS ==========
    function apiCall(endpoint, method, data, callback) {
        var url = config.apiUrl + endpoint;

        $.ajax({
            type: method || 'GET',
            url: url,
            data: data || {},
            dataType: 'json',
            timeout: 15000,
            success: function (response) {
                if (callback) callback(null, response);
            },
            error: function (xhr, status, error) {
                log('API Error: ' + endpoint, {
                    status: status,
                    error: error,
                    response: xhr.responseText
                });
                if (callback) callback(error, null);
            }
        });
    }

    function registerToken(token, callback) {
        if (!state.userId || !token) {
            log('❌ Cannot register token: missing userId or token');
            log('   User ID: ' + state.userId);
            log('   Token: ' + (token ? 'exists' : 'NULL'));
            if (callback) callback('Missing data');
            return;
        }

        log('📤 Registering token to server...');
        log('   User ID: ' + state.userId);
        log('   Token length: ' + token.length);
        log('   API URL: ' + config.apiUrl + '/fcm/register');

        apiCall('/fcm/register', 'POST', {
            user_id: state.userId,
            fcm_token: token
        }, function (err, response) {
            if (err) {
                log('❌ Failed to register token');
                log('   Error: ' + err);
                if (callback) callback(err);
                return;
            }

            log('✅ Token registered successfully!');
            log('   Response: ' + JSON.stringify(response));

            state.fcmToken = token;
            localStorage.setItem('fcm_token', token);
            localStorage.setItem('token_registered', 'true');
            localStorage.setItem('token_registered_at', new Date().toISOString());
            localStorage.setItem('token_registered_user', state.userId);

            if (callback) callback(null, response);
        });
    }

    function unregisterToken(callback) {
        if (!state.userId || !state.fcmToken) {
            log('⚠️ No token to unregister');
            if (callback) callback();
            return;
        }

        log('📤 Unregistering token from server...');

        apiCall('/fcm/unregister', 'POST', {
            user_id: state.userId,
            fcm_token: state.fcmToken
        }, function (err) {
            if (err) {
                log('❌ Failed to unregister token', err);
            } else {
                log('✅ Token unregistered successfully');
            }

            state.fcmToken = null;
            localStorage.removeItem('fcm_token');
            localStorage.removeItem('token_registered');
            localStorage.removeItem('token_registered_at');
            localStorage.removeItem('token_registered_user');

            if (callback) callback();
        });
    }

    function fetchNotifications(callback) {
        if (!state.userId) {
            if (callback) callback('No user ID');
            return;
        }

        log('📥 Fetching notifications from server...');

        apiCall('/notifications', 'GET', {
            user_id: state.userId,
            per_page: config.maxNotifications
        }, function (err, response) {
            if (err || !response || !response.success) {
                log('❌ Failed to fetch notifications', err);
                if (callback) callback(err);
                return;
            }

            if (response.data && response.data.data) {
                state.notifications = response.data.data;
                saveToStorage();
                renderNotificationList();
                log('✅ Fetched ' + state.notifications.length + ' notifications');
            }

            if (callback) callback(null, response);
        });
    }

    function fetchUnreadCount(callback) {
        if (!state.userId) {
            if (callback) callback('No user ID');
            return;
        }

        log('📥 Fetching unread count...');

        apiCall('/notifications/unread-count', 'GET', {
            user_id: state.userId
        }, function (err, response) {
            if (err || !response || !response.success) {
                log('❌ Failed to fetch unread count', err);
                if (callback) callback(err);
                return;
            }

            state.unreadCount = response.count || 0;
            updateBadge();
            saveToStorage();
            log('✅ Unread count: ' + state.unreadCount);

            if (callback) callback(null, response);
        });
    }

    // ========== FIREBASE FUNCTIONS ==========

    function detectFirebasePlugin() {
        if (typeof cordova === 'undefined' || typeof cordova.plugins === 'undefined') {
            return null;
        }

        // Check FirebaseX (Recommended)
        if (typeof window.FirebasePlugin !== 'undefined') {
            console.log('✅ Detected: FirebaseX Plugin');
            return 'firebasex';
        }

        // Check Firebase Messaging (Old)
        if (cordova.plugins.firebase && cordova.plugins.firebase.messaging) {
            console.log('✅ Detected: Firebase Messaging Plugin');
            return 'firebase-messaging';
        }

        console.log('❌ No Firebase plugin detected');
        return null;
    }

    /**
     * Check if Firebase plugin is available
     */
    function isFirebasePluginAvailable() {
        var pluginType = detectFirebasePlugin();
        return pluginType !== null;
    }

    /**
     * Initialize Firebase and request permissions
     */
    function initFirebase() {
        log('🔥 Initializing Firebase...');

        // Check if Firebase plugin available
        if (!isFirebasePluginAvailable()) {
            log('❌ Firebase plugin not available, skipping initialization');
            state.firebaseReady = false;
            return;
        }

        log('✅ Firebase plugin detected');

        // Request notification permission
        requestNotificationPermission(function (granted) {
            if (!granted) {
                log('❌ Notification permission denied');
                state.firebaseReady = false;
                return;
            }

            log('✅ Notification permission granted');

            // Get FCM token
            getToken();

            // Setup listeners
            setupFirebaseListeners();

            state.firebaseReady = true;
            log('✅ Firebase initialized and ready');
        });
    }

    /**
     * Request notification permission (compatible dengan kedua plugin)
     */
    function requestNotificationPermission(callback) {
        var pluginType = detectFirebasePlugin();

        if (!pluginType) {
            log('❌ No Firebase plugin available');
            if (callback) callback(false);
            return;
        }

        log('📱 Requesting notification permission...');

        if (pluginType === 'firebasex') {
            // FirebaseX API
            window.FirebasePlugin.grantPermission(function (hasPermission) {
                log('✅ Permission granted: ' + hasPermission);
                if (callback) callback(hasPermission);
            }, function (error) {
                log('❌ Permission denied: ' + error);
                if (callback) callback(false);
            });
        } else {
            // Firebase Messaging API
            try {
                cordova.plugins.firebase.messaging.requestPermission({
                    forceShow: true
                }).then(function () {
                    log('✅ Permission granted');
                    if (callback) callback(true);
                }).catch(function (error) {
                    log('❌ Permission denied: ' + error);
                    if (callback) callback(false);
                });
            } catch (e) {
                log('❌ Error requesting permission: ' + e);
                if (callback) callback(false);
            }
        }
    }

    /**
     * Get FCM token (compatible dengan kedua plugin)
     */
    function getToken() {
        var pluginType = detectFirebasePlugin();

        if (!pluginType) {
            log('❌ Cannot get token: No Firebase plugin');
            return;
        }

        log('📱 Getting FCM token...');
        log('   Plugin: ' + pluginType);

        if (pluginType === 'firebasex') {
            // FirebaseX API
            window.FirebasePlugin.getToken(function (token) {
                if (!token) {
                    log('❌ No token received');
                    return;
                }

                log('✅ Got FCM token (FirebaseX)');
                log('   Token length: ' + token.length);
                log('   Token preview: ' + token.substring(0, 30) + '...');

                // Register token to server
                registerToken(token, function (err, response) {
                    if (!err) {
                        log('✅ Token registered to server');
                        fetchNotifications();
                        fetchUnreadCount();
                    } else {
                        log('❌ Failed to register token to server');
                    }
                });
            }, function (error) {
                log('❌ Failed to get token: ' + error);
            });
        } else {
            // Firebase Messaging API
            try {
                cordova.plugins.firebase.messaging.getToken().then(function (token) {
                    if (!token) {
                        log('❌ No token received');
                        return;
                    }

                    log('✅ Got FCM token (Firebase Messaging)');
                    log('   Token length: ' + token.length);
                    log('   Token preview: ' + token.substring(0, 30) + '...');

                    registerToken(token, function (err, response) {
                        if (!err) {
                            log('✅ Token registered to server');
                            fetchNotifications();
                            fetchUnreadCount();
                        }
                    });
                }).catch(function (error) {
                    log('❌ Failed to get token: ' + error);
                });
            } catch (e) {
                log('❌ Exception getting token: ' + e);
            }
        }
    }

    /**
     * Setup Firebase message listeners (compatible dengan kedua plugin)
     */
    function setupFirebaseListeners() {
        var pluginType = detectFirebasePlugin();

        if (!pluginType) {
            log('❌ Cannot setup listeners: No Firebase plugin');
            return;
        }

        log('📱 Setting up Firebase listeners...');
        log('   Plugin: ' + pluginType);

        if (pluginType === 'firebasex') {
            // FirebaseX API

            // Listen for messages
            window.FirebasePlugin.onMessageReceived(function (message) {
                log('📩 Received message (FirebaseX)');
                log('   Message: ' + JSON.stringify(message));

                handleIncomingNotification(message);
            }, function (error) {
                log('❌ Error in onMessageReceived: ' + error);
            });

            // Listen for token refresh
            window.FirebasePlugin.onTokenRefresh(function (token) {
                log('🔄 Token refreshed (FirebaseX)');
                log('   New token: ' + token.substring(0, 30) + '...');

                registerToken(token);
            }, function (error) {
                log('❌ Error in onTokenRefresh: ' + error);
            });

        } else {
            // Firebase Messaging API

            try {
                // Foreground messages
                cordova.plugins.firebase.messaging.onMessage(function (payload) {
                    log('📩 Received message (foreground)');
                    log('   Payload: ' + JSON.stringify(payload));

                    handleIncomingNotification(payload);
                }, function (error) {
                    log('❌ Error in onMessage: ' + error);
                });

                // Background messages
                cordova.plugins.firebase.messaging.onBackgroundMessage(function (payload) {
                    log('📩 Received message (background)');
                    log('   Payload: ' + JSON.stringify(payload));

                    handleIncomingNotification(payload);
                }, function (error) {
                    log('❌ Error in onBackgroundMessage: ' + error);
                });

                // Token refresh
                cordova.plugins.firebase.messaging.onTokenRefresh(function (token) {
                    log('🔄 Token refreshed');
                    log('   New token: ' + token.substring(0, 30) + '...');

                    registerToken(token);
                }, function (error) {
                    log('❌ Error in onTokenRefresh: ' + error);
                });

            } catch (e) {
                log('❌ Exception setting up listeners: ' + e);
            }
        }

        log('✅ Firebase listeners setup complete');
    }

    /**
     * Handle incoming notification
     */
    function handleIncomingNotification(payload) {
        log('📨 Processing incoming notification...');

        try {
            // Extract notification data
            var title = payload.title || payload.notification?.title || 'Notifikasi Baru';
            var body = payload.body || payload.notification?.body || '';
            var data = payload.data || {};

            log('   Title: ' + title);
            log('   Body: ' + body);

            // Create notification object
            var notification = {
                id: data.notification_id || 'temp_' + Date.now(),
                title: title,
                message: body,
                data: JSON.stringify(data),
                is_read: 0,
                dt_record: new Date().toISOString()
            };

            // Add to notifications list
            state.notifications.unshift(notification);
            if (state.notifications.length > config.maxNotifications) {
                state.notifications = state.notifications.slice(0, config.maxNotifications);
            }

            // Update unread count
            state.unreadCount++;

            // Save and update UI
            saveToStorage();
            updateBadge();
            renderNotificationList();

            // Show toast notification
            showToastNotification(title, body);

            // Play notification sound
            playNotificationSound();

            log('✅ Notification processed');
        } catch (e) {
            log('❌ Error processing notification: ' + e);
        }
    }

    /**
     * Show toast notification
     */
    function showToastNotification(title, body) {
        var toast = document.getElementById('toastNotif');
        if (!toast) return;

        var titleEl = document.getElementById('toastTitle');
        var bodyEl = document.getElementById('toastBody');

        if (titleEl) titleEl.textContent = title;
        if (bodyEl) bodyEl.textContent = body;

        toast.style.display = 'block';
        toast.classList.add('show');

        setTimeout(function () {
            toast.classList.remove('show');
            setTimeout(function () {
                toast.style.display = 'none';
            }, 300);
        }, config.toastDuration);
    }

    // ========== UI FUNCTIONS ==========

    function renderNotificationList() {
        var list = document.getElementById('notifList');
        if (!list) return;

        if (state.notifications.length === 0) {
            list.innerHTML = '<li class="no-notifications">Tidak ada notifikasi</li>';
            return;
        }

        var html = '';
        state.notifications.forEach(function (notif) {
            var isRead = notif.is_read == 1;
            html += '<li class="notification-item' + (isRead ? '' : ' unread') + '" data-id="' + notif.id + '">';
            html += '  <div class="notification-content" onclick="NotificationManager.showDetail(' + notif.id + ')">';
            html += '    <h4>' + notif.title + '</h4>';
            html += '    <p>' + notif.message + '</p>';
            html += '    <span class="notification-time">' + formatDate(notif.dt_record) + '</span>';
            html += '  </div>';
            html += '</li>';
        });

        list.innerHTML = html;
    }

    function togglePanel() {
        var panel = document.getElementById('notifPanel');
        if (!panel) return;

        if (panel.style.display === 'block') {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'block';
            renderNotificationList();

            // Play sound if there are unread notifications
            if (state.unreadCount > 0) {
                playNotificationSound();
            }
        }
    }

    function showNotificationDetail(id) {
        var notification = state.notifications.find(function (n) { return n.id == id; });
        if (!notification) return;

        // Update detail popup
        var titleEl = document.getElementById('detailNotifTitle');
        var bodyEl = document.getElementById('detailNotifBody');
        var timeEl = document.getElementById('detailNotifTime');
        var statusEl = document.getElementById('detailNotifStatus');

        if (titleEl) titleEl.textContent = notification.title;
        if (bodyEl) bodyEl.textContent = notification.message;
        if (timeEl) timeEl.textContent = formatDate(notification.dt_record);
        if (statusEl) {
            statusEl.textContent = notification.is_read == 1 ? 'Dibaca' : 'Belum Dibaca';
            statusEl.style.background = notification.is_read == 1 ?
                'rgba(0, 122, 255, 0.2)' : 'rgba(234, 74, 10, 0.2)';
            statusEl.style.color = notification.is_read == 1 ? '#007aff' : '#ea480a';
        }

        // Mark as read
        if (notification.is_read == 0) {
            markAsRead(id);
        }

        // Open popup
        if (typeof app !== 'undefined' && app.popup) {
            app.popup.open('#notifDetailPopup');
        }
    }

    function markAsRead(id) {
        var notification = state.notifications.find(function (n) { return n.id == id; });
        if (!notification || notification.is_read == 1) return;

        log('📝 Marking notification as read: ' + id);

        apiCall('/notifications/' + id + '/read', 'POST', {
            user_id: state.userId
        }, function (err) {
            if (err) {
                log('❌ Failed to mark as read');
                return;
            }

            log('✅ Marked as read');

            notification.is_read = 1;
            state.unreadCount = Math.max(0, state.unreadCount - 1);

            saveToStorage();
            updateBadge();
            renderNotificationList();
        });
    }

    function markAllAsRead() {
        log('📝 Marking all notifications as read...');

        apiCall('/notifications/mark-all-read', 'POST', {
            user_id: state.userId
        }, function (err) {
            if (err) {
                log('❌ Failed to mark all as read');
                return;
            }

            log('✅ All marked as read');

            state.notifications.forEach(function (n) { n.is_read = 1; });
            state.unreadCount = 0;

            saveToStorage();
            updateBadge();
            renderNotificationList();
        });
    }

    function deleteNotification(id) {
        log('🗑️ Deleting notification: ' + id);

        apiCall('/notifications/' + id, 'DELETE', {
            user_id: state.userId
        }, function (err) {
            if (err) {
                log('❌ Failed to delete notification');
                return;
            }

            log('✅ Notification deleted');

            var notification = state.notifications.find(function (n) { return n.id == id; });
            if (notification && notification.is_read == 0) {
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }

            state.notifications = state.notifications.filter(function (n) { return n.id != id; });

            saveToStorage();
            updateBadge();
            renderNotificationList();
        });
    }

    function clearAllNotifications() {
        log('🗑️ Clearing all read notifications...');

        apiCall('/notifications/delete-all-read', 'POST', {
            user_id: state.userId
        }, function (err) {
            if (err) {
                log('❌ Failed to clear notifications');
                return;
            }

            log('✅ All read notifications cleared');

            state.notifications = state.notifications.filter(function (n) { return n.is_read == 0; });

            saveToStorage();
            renderNotificationList();
        });
    }

    function bindEvents() {
        log('🔗 Binding UI events...');

        var notifIcon = document.getElementById('notifIcon');
        if (notifIcon) {
            notifIcon.onclick = togglePanel;
        }

        var closeBtn = document.getElementById('closePanel');
        if (closeBtn) {
            closeBtn.onclick = function () {
                document.getElementById('notifPanel').style.display = 'none';
            };
        }

        var markAllBtn = document.getElementById('markAllRead');
        if (markAllBtn) {
            markAllBtn.onclick = markAllAsRead;
        }

        var clearAllBtn = document.getElementById('clearAllNotif');
        if (clearAllBtn) {
            clearAllBtn.onclick = function () {
                if (confirm('Hapus semua notifikasi yang sudah dibaca?')) {
                    clearAllNotifications();
                }
            };
        }

        document.addEventListener('click', function (e) {
            var panel = document.getElementById('notifPanel');
            var notifIcon = document.getElementById('notifIcon');

            if (panel && panel.style.display === 'block') {
                if (!panel.contains(e.target) && !notifIcon.contains(e.target)) {
                    panel.style.display = 'none';
                }
            }
        });
    }

    // ========== PUBLIC API ==========
    return {
        config: config,

        /**
         * Initialize NotificationManager
         * @param {string|number} userId - User ID
         * @param {boolean} forceRefresh - True untuk login, false untuk startup
         */
        init: function (userId, forceRefresh) {
            if (!userId) {
                log('❌ Cannot initialize: userId is required');
                return;
            }

            // Prevent re-initialization untuk user yang sama (kecuali force refresh)
            if (state.isInitialized && state.userId === userId && !forceRefresh) {
                log('⚠️ Already initialized for user: ' + userId);
                return;
            }

            log('🚀 Initializing NotificationManager...');
            log('   User ID: ' + userId);
            log('   Force Refresh: ' + forceRefresh);
            log('   Mode: ' + (forceRefresh ? 'LOGIN' : 'STARTUP'));

            state.userId = userId;

            // Update API URL
            if (typeof BASE_API !== 'undefined') {
                config.apiUrl = BASE_API;
            }

            // Load dari storage
            loadFromStorage();
            updateBadge();

            // Bind UI events (hanya sekali)
            if (!state.isInitialized) {
                bindEvents();
            }

            // Handle Firebase initialization
            if (forceRefresh) {
                // MODE LOGIN: Initialize Firebase dari awal
                log('📱 LOGIN MODE: Initializing Firebase completely...');
                initFirebase();
            } else {
                // MODE STARTUP: Hanya setup listeners jika token sudah ada
                log('📱 STARTUP MODE: Setting up Firebase listeners...');

                var savedToken = localStorage.getItem('fcm_token');
                var tokenRegistered = localStorage.getItem('token_registered');

                if (savedToken && tokenRegistered === 'true') {
                    log('   Token found in storage: ' + savedToken.substring(0, 30) + '...');
                    state.fcmToken = savedToken;

                    // Setup listeners jika Firebase available
                    if (isFirebasePluginAvailable()) {
                        setupFirebaseListeners();
                        state.firebaseReady = true;
                    }
                } else {
                    log('   No valid token found, will wait for login');
                }
            }

            state.isInitialized = true;
            log('✅ NotificationManager initialized');
        },

        /**
         * Cleanup saat logout
         */
        cleanup: function (callback) {
            log('🧹 Cleaning up NotificationManager...');

            unregisterToken(function () {
                state.userId = null;
                state.fcmToken = null;
                state.notifications = [];
                state.unreadCount = 0;
                state.isInitialized = false;
                state.firebaseReady = false;

                localStorage.removeItem(config.storageKey);
                localStorage.removeItem(config.storageKey + '_count');
                localStorage.removeItem('fcm_token');
                localStorage.removeItem('token_registered');
                localStorage.removeItem('token_registered_at');
                localStorage.removeItem('token_registered_user');

                updateBadge();

                log('✅ Cleanup complete');
                if (callback) callback();
            });
        },

        /**
         * Check if Firebase is available
         */
        isFirebaseAvailable: function () {
            return isFirebasePluginAvailable();
        },

        /**
         * Get Firebase token manually
         */
        getFirebaseToken: function () {
            getToken();
        },

        /**
         * Force refresh token (untuk testing)
         */
        forceRefreshToken: function () {
            if (!isFirebasePluginAvailable()) {
                log('⚠️ Firebase not available');
                return;
            }

            log('🔄 Force refreshing token...');
            getToken();
        },

        // Public methods
        deleteNotif: function (id) {
            deleteNotification(id);
        },

        markAsRead: function (id) {
            markAsRead(id);
        },

        showDetail: function (id) {
            showNotificationDetail(id);
        },

        togglePanel: togglePanel,

        getUnreadCount: function () {
            return state.unreadCount;
        },

        getNotifications: function () {
            return state.notifications;
        },

        isInitialized: function () {
            return state.isInitialized;
        },

        // Sound control functions
        enableSound: function () {
            config.soundEnabled = true;
            log('🔊 Notification sound enabled');
        },

        disableSound: function () {
            config.soundEnabled = false;
            log('🔇 Notification sound disabled');
        },

        isSoundEnabled: function () {
            return config.soundEnabled;
        },

        testSound: function () {
            log('🔊 Testing notification sound...');
            playNotificationSound();
        },

        // Debug functions
        debugInfo: function () {
            console.log('=== Notification Manager Debug Info ===');
            console.log('User ID:', state.userId);
            console.log('FCM Token:', state.fcmToken ? state.fcmToken.substring(0, 30) + '...' : 'None');
            console.log('Firebase Ready:', state.firebaseReady);
            console.log('Firebase Available:', isFirebasePluginAvailable());
            console.log('Unread Count:', state.unreadCount);
            console.log('Total Notifications:', state.notifications.length);
            console.log('Initialized:', state.isInitialized);
            console.log('API URL:', config.apiUrl);
            console.log('Sound Enabled:', config.soundEnabled);
            console.log('Sound Path:', config.soundPath);
            console.log('========================================');
        },

        testNotification: function () {
            handleIncomingNotification({
                title: 'Test Notification',
                body: 'This is a test notification at ' + new Date().toLocaleTimeString(),
                type: 'test'
            });
        }
    };
})();


// ========== HELPER FUNCTIONS FOR GLOBAL USE ==========

/**
 * Initialize NotificationManager saat app startup
 * Dipanggil di app.js on init
 */
function initNotificationManagerOnStartup() {
    var userId = localStorage.getItem('user_id');

    if (!userId || localStorage.getItem("login") !== "true") {
        console.log('[Global] Not logged in, skipping notification init');
        return;
    }

    console.log('[Global] Initializing NotificationManager on app startup');
    console.log('[Global] User ID: ' + userId);

    // Init dengan forceRefresh = false (startup mode)
    NotificationManager.init(userId, false);
}

/**
 * Initialize NotificationManager setelah login
 * Dipanggil di login.js setelah login berhasil
 */
function initNotificationManagerAfterLogin() {
    var userId = localStorage.getItem('user_id');

    if (!userId) {
        console.log('[Global] No user ID found after login');
        return;
    }

    console.log('[Global] Initializing NotificationManager after login');
    console.log('[Global] User ID: ' + userId);

    // Init dengan forceRefresh = true (login mode)
    NotificationManager.init(userId, true);
}

/**
 * Cleanup NotificationManager saat logout
 * Dipanggil di global.js function logOut()
 */
function cleanupNotificationManager(callback) {
    console.log('[Global] Cleaning up NotificationManager');
    NotificationManager.cleanup(callback);
}

/**
 * Debug notification state
 */
function debugNotificationManager() {
    NotificationManager.debugInfo();
}