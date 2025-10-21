-- Add test subscription for user 'fetyany' (phone: 01065539628)
-- This subscription allows listing products

INSERT INTO "ProviderSubscription" (
    "id",
    "providerId",
    "planType",
    "pricePerYear",
    "canTakeBookings",
    "canListProducts",
    "searchPriority",
    "isActive",
    "expiresAt",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid(),
    'fd352bf9-2d0a-496f-b434-43e4c0e133c9', -- User ID for 'fetyany'
    'PRODUCTS_PREMIUM',
    999.00,
    true,
    true,
    5,
    true,
    NOW() + INTERVAL '1 year',
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

