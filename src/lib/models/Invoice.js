import mongoose from 'mongoose';
import './Client'; // Import Client model first to register it

const InvoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const InvoiceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  invoiceNumber: {
    type: String,
    unique: true,
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  items: [InvoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paidAt: {
    type: Date,
    default: null,
  },
  emailSent: {
  type: Boolean,
  default: false,
},
});

// Add index for faster lookups
InvoiceSchema.index({ userId: 1, invoiceNumber: 1 });

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);