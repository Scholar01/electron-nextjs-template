/** @type {import('next').NextConfig} */

const nextConfig = {
    output: process.env.NODE_ENV === 'development' ? undefined : 'export',
    distDir: process.env.NODE_ENV === 'development' ? undefined : '../../dist',
}

module.exports = nextConfig
