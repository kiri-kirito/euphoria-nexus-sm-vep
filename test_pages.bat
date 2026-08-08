@echo off
echo Testing all pages...
echo.

set BASE=http://localhost:3000

echo [PUBLIC PAGES]
curl -s -o nul -w "/ -> %%{http_code}\n" %BASE%/
curl -s -o nul -w "/explore -> %%{http_code}\n" %BASE%/explore
curl -s -o nul -w "/product/1 -> %%{http_code}\n" %BASE%/product/1
curl -s -o nul -w "/cart -> %%{http_code}\n" %BASE%/cart
curl -s -o nul -w "/checkout -> %%{http_code}\n" %BASE%/checkout
curl -s -o nul -w "/profile -> %%{http_code}\n" %BASE%/profile
curl -s -o nul -w "/wishlist -> %%{http_code}\n" %BASE%/wishlist
curl -s -o nul -w "/orders -> %%{http_code}\n" %BASE%/orders
curl -s -o nul -w "/seller/apply -> %%{http_code}\n" %BASE%/seller/apply

echo.
echo [SELLER DASHBOARD]
curl -s -o nul -w "/seller/dashboard -> %%{http_code}\n" %BASE%/seller/dashboard
curl -s -o nul -w "/seller/products -> %%{http_code}\n" %BASE%/seller/products
curl -s -o nul -w "/seller/products/new -> %%{http_code}\n" %BASE%/seller/products/new
curl -s -o nul -w "/seller/negotiations -> %%{http_code}\n" %BASE%/seller/negotiations
curl -s -o nul -w "/seller/bidding -> %%{http_code}\n" %BASE%/seller/bidding
curl -s -o nul -w "/seller/bundling -> %%{http_code}\n" %BASE%/seller/bundling
curl -s -o nul -w "/seller/analytics -> %%{http_code}\n" %BASE%/seller/analytics
curl -s -o nul -w "/seller/settings -> %%{http_code}\n" %BASE%/seller/settings
curl -s -o nul -w "/seller/orders -> %%{http_code}\n" %BASE%/seller/orders

echo.
echo [DELIVERY DASHBOARD]
curl -s -o nul -w "/delivery/dashboard -> %%{http_code}\n" %BASE%/delivery/dashboard
curl -s -o nul -w "/delivery/tasks -> %%{http_code}\n" %BASE%/delivery/tasks
curl -s -o nul -w "/delivery/earnings -> %%{http_code}\n" %BASE%/delivery/earnings
curl -s -o nul -w "/delivery/profile -> %%{http_code}\n" %BASE%/delivery/profile

echo.
echo [SUPPORT DASHBOARD]
curl -s -o nul -w "/support/dashboard -> %%{http_code}\n" %BASE%/support/dashboard
curl -s -o nul -w "/support/tickets -> %%{http_code}\n" %BASE%/support/tickets
curl -s -o nul -w "/support/escrow -> %%{http_code}\n" %BASE%/support/escrow
curl -s -o nul -w "/support/moderation -> %%{http_code}\n" %BASE%/support/moderation

echo.
echo [ADMIN DASHBOARD]
curl -s -o nul -w "/admin/dashboard -> %%{http_code}\n" %BASE%/admin/dashboard
curl -s -o nul -w "/admin/users -> %%{http_code}\n" %BASE%/admin/users
curl -s -o nul -w "/admin/sellers -> %%{http_code}\n" %BASE%/admin/sellers
curl -s -o nul -w "/admin/cms -> %%{http_code}\n" %BASE%/admin/cms
curl -s -o nul -w "/admin/settings -> %%{http_code}\n" %BASE%/admin/settings
curl -s -o nul -w "/admin/payouts -> %%{http_code}\n" %BASE%/admin/payouts
curl -s -o nul -w "/admin/logs -> %%{http_code}\n" %BASE%/admin/logs

echo.
echo [SHOULD NOT EXIST - deleted pages]
curl -s -o nul -w "/login -> %%{http_code} (should be 404)\n" %BASE%/login
curl -s -o nul -w "/register -> %%{http_code} (should be 404)\n" %BASE%/register

echo.
echo Done!
