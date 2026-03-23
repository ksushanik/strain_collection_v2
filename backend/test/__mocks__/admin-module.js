'use strict';
// Mock for admin.module.ts — prevents dynamic ESM imports of adminjs in e2e tests
const { Module } = require('@nestjs/common');

class AdminModuleMock {}
// Apply @Module decorator
require('@nestjs/common').Module({ imports: [], controllers: [], providers: [] })(AdminModuleMock);

module.exports = { AdminModule: AdminModuleMock };
