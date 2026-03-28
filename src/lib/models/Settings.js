import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  // Profile Settings
  companyName: {
    type: String,
    default: 'Your Business',
  },
  businessEmail: {
    type: String,
    default: '',
  },
  businessPhone: {
    type: String,
    default: '',
  },
  businessAddress: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: '' },
  },
  businessLogo: {
    type: String,
    default: '',
  },
  currency: {
    type: String,
    default: 'USD',
  },
  
  // Invoice Settings
  invoicePrefix: {
    type: String,
    default: 'INV',
  },
  nextInvoiceNumber: {
    type: Number,
    default: 1,
  },
  defaultDueDays: {
    type: Number,
    default: 15,
  },
  defaultTaxRate: {
    type: Number,
    default: 0,
  },
  defaultInvoiceNotes: {
    type: String,
    default: 'Payment is due within 15 days. Thank you for your business!',
  },
  
  // Email Settings
  senderEmail: {
    type: String,
    default: '',
  },
  emailTemplate: {
    type: String,
    default: 'Thank you for your business! Please find your invoice attached.',
  },
  bccEmail: {
    type: String,
    default: '',
  },
  
  // Notification Settings
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  overdueReminders: {
    type: Boolean,
    default: true,
  },
  paymentConfirmation: {
    type: Boolean,
    default: true,
  },
  
  // Appearance
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'light',
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

SettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);