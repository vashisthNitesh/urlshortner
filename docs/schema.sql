CREATE TABLE shortener_userprofile (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    plan VARCHAR(20) NOT NULL DEFAULT 'free',
    subscription_active BOOLEAN NOT NULL DEFAULT FALSE,
    subscription_ends_at TIMESTAMP NULL,
    grace_period_ends_at TIMESTAMP NULL,
    razorpay_customer_id VARCHAR(100) NOT NULL DEFAULT '',
    api_key VARCHAR(64) UNIQUE,
    api_key_created_at TIMESTAMP NULL,
    theme_preference VARCHAR(10) NOT NULL DEFAULT 'light'
);

CREATE TABLE shortener_customdomain (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    domain VARCHAR(255) UNIQUE NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE shortener_tag (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE shortener_link (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES auth_user(id) ON DELETE SET NULL,
    custom_domain_id BIGINT REFERENCES shortener_customdomain(id) ON DELETE SET NULL,
    guest_email VARCHAR(254) NOT NULL DEFAULT '',
    slug VARCHAR(80) UNIQUE NOT NULL,
    destination_url TEXT NOT NULL,
    title VARCHAR(200) NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    starts_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    redirect_type SMALLINT NOT NULL DEFAULT 301,
    utm_source VARCHAR(100) NOT NULL DEFAULT '',
    utm_medium VARCHAR(100) NOT NULL DEFAULT '',
    utm_campaign VARCHAR(100) NOT NULL DEFAULT '',
    utm_term VARCHAR(100) NOT NULL DEFAULT '',
    utm_content VARCHAR(100) NOT NULL DEFAULT '',
    qr_code_image VARCHAR(100) NOT NULL DEFAULT '',
    last_destination_change_at TIMESTAMP NULL,
    destination_change_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE shortener_link_tags (
    id BIGSERIAL PRIMARY KEY,
    link_id BIGINT NOT NULL REFERENCES shortener_link(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES shortener_tag(id) ON DELETE CASCADE
);

CREATE TABLE shortener_clickevent (
    id BIGSERIAL PRIMARY KEY,
    link_id BIGINT NOT NULL REFERENCES shortener_link(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL,
    referrer VARCHAR(255) NOT NULL DEFAULT '',
    ip_address INET NULL,
    user_agent VARCHAR(255) NOT NULL DEFAULT '',
    device VARCHAR(100) NOT NULL DEFAULT '',
    browser VARCHAR(100) NOT NULL DEFAULT '',
    country VARCHAR(100) NOT NULL DEFAULT '',
    is_qr BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE shortener_linkdestinationchange (
    id BIGSERIAL PRIMARY KEY,
    link_id BIGINT NOT NULL REFERENCES shortener_link(id) ON DELETE CASCADE,
    previous_url TEXT NOT NULL,
    new_url TEXT NOT NULL,
    changed_at TIMESTAMP NOT NULL,
    changed_by_id BIGINT REFERENCES auth_user(id) ON DELETE SET NULL
);

CREATE TABLE shortener_utmtemplate (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL,
    medium VARCHAR(100) NOT NULL,
    campaign VARCHAR(100) NOT NULL,
    term VARCHAR(100) NOT NULL DEFAULT '',
    content VARCHAR(100) NOT NULL DEFAULT ''
);

CREATE TABLE shortener_subscriptionevent (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    plan VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    razorpay_event_id VARCHAR(100) NOT NULL DEFAULT '',
    payload JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL
);
