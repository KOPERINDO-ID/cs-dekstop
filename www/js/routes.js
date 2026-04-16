var routes = [
  {
    path: '/',
    url: './index.html',
  },
  {
    path: '/sales',
    url: './pages/penjualan.html',
  },
  {
    path: '/client',
    url: './pages/client.html',
  },
  {
    path: '/notif',
    url: './pages/notif.html',
  },
  {
    path: '/kpi',
    url: './pages/kpi.html',
  },
  {
    path: '/kpi_broadcast',
    url: './pages/kpi_broadcast.html',
  },
  {
    path: '/delay-go',
    url: './pages/delay_go.html',
  },
  {
    path: '/log',
    url: './pages/log.html',
  },
  {
    path: '/tools',
    url: './pages/tools.html',
  },
  {
    path: '/share_link',
    url: './pages/share_link.html',
  },
  {
    path: '/point-sales',
    url: './pages/point_sales.html',
  },
  {
    path: '/point-produksi',
    url: './pages/point_produksi.html',
  },
  {
    path: '/history-point-produksi',
    url: './pages/history_point_produksi.html',
  },
  {
    path: '/point-admin',
    url: './pages/point_admin.html',
  },
  {
    path: '/history-point-admin',
    url: './pages/history_point_admin.html',
  },
  {
    path: '/point-sj',
    url: './pages/point_sj.html',
  },
  {
    path: '/history-point-sj',
    url: './pages/history_point_sj.html',
  },
  {
    path: '/login',
    url: './pages/login.html',
  },
  // {
  //   path: '/surat_jalan',
  //   url: './pages/surat_jalan.html',
  // },
  {
    path: '/absen-sales',
    url: './pages/absen_sales.html',
  },
  {
    path: '/data-gaji-sales',
    url: './pages/data_gaji_sales.html',
  },
  {
    path: '/penjualan-input-single',
    url: './pages/penjualan_input_single.html',
  },
  {
    path: '/penjualan-input',
    url: './pages/penjualan_input.html',
  },
  {
    path: '/katalog',
    url: './pages/katalog.html',
  },
  {
    path: '/detail-product',
    url: './pages/detail_product.html',
  },
  {
    path: '/kunjungan-sales',
    url: './pages/kunjungan_sales.html',
  },
  {
    path: '/kunjungan',
    url: './pages/kunjungan.html',
  },
  {
    path: '/prospek',
    url: './pages/prospek.html',
  },
  {
    path: '/tagihan',
    url: './pages/tagihan.html',
  },
  {
    path: '/pengiriman',
    url: './pages/pengiriman.html',
  },
  {
    path: '/surat_jalan',
    url: './pages/surat_jalan_admin.html',
  },
  {
    path: '/form/',
    url: './pages/form.html',
  },
  {
    path: '/product/:id/',
    componentUrl: './pages/product.html',
  },
  {
    path: '/settings/',
    url: './pages/settings.html',
  },
  {
    path: '/dynamic-route/blog/:blogId/post/:postId/',
    componentUrl: './pages/dynamic-route.html',
  },
  {
    path: '/request-and-load/user/:userId/',
    async: function (routeTo, routeFrom, resolve, reject) {
      // Router instance
      var router = this;

      // App instance
      var app = router.app;

      // Show Preloader
      app.preloader.show();

      // User ID from request
      var userId = routeTo.params.userId;

      // Simulate Ajax Request
      setTimeout(function () {
        // We got user data from request
        var user = {
          firstName: 'Vladimir',
          lastName: 'Kharlampidi',
          about: 'Hello, i am creator of Framework7! Hope you like it!',
          links: [
            {
              title: 'Framework7 Website',
              url: 'http://framework7.io',
            },
            {
              title: 'Framework7 Forum',
              url: 'http://forum.framework7.io',
            },
          ]
        };
        // Hide Preloader
        app.preloader.hide();

        // Resolve route to load page
        resolve(
          {
            componentUrl: './pages/request-and-load.html',
          },
          {
            context: {
              user: user,
            }
          }
        );
      }, 1000);
    },
  },
  // Default route (404 page). MUST BE THE LAST
  {
    path: '/performa/input',
    url: './pages/performa_input.html',
  },
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];