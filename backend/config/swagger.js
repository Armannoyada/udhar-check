const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Udhar - Lending & Borrowing Platform API',
      version: '1.0.0',
      description: 'API documentation for the Udhar peer-to-peer lending and borrowing platform',
      contact: {
        name: 'API Support',
        email: 'support@udhar.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.udhar.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            role: {
              type: 'string',
              enum: ['admin', 'lender', 'borrower']
            },
            firstName: {
              type: 'string'
            },
            lastName: {
              type: 'string'
            },
            phone: {
              type: 'string'
            },
            whatsapp: {
              type: 'string'
            },
            address: {
              type: 'string'
            },
            city: {
              type: 'string'
            },
            state: {
              type: 'string'
            },
            pincode: {
              type: 'string'
            },
            profilePhoto: {
              type: 'string'
            },
            isOnboardingComplete: {
              type: 'boolean'
            },
            isAdminVerified: {
              type: 'boolean'
            },
            verificationStatus: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected']
            },
            trustScore: {
              type: 'integer'
            },
            repaymentScore: {
              type: 'integer'
            }
          }
        },
        LoanRequest: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            borrowerId: {
              type: 'string',
              format: 'uuid'
            },
            lenderId: {
              type: 'string',
              format: 'uuid'
            },
            amount: {
              type: 'number',
              format: 'decimal'
            },
            purpose: {
              type: 'string'
            },
            duration: {
              type: 'integer',
              description: 'Duration in days'
            },
            interestRate: {
              type: 'number',
              format: 'decimal'
            },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected', 'fulfilled', 'in_progress', 'completed', 'defaulted', 'disputed']
            },
            totalRepayable: {
              type: 'number',
              format: 'decimal'
            },
            amountRepaid: {
              type: 'number',
              format: 'decimal'
            },
            remainingAmount: {
              type: 'number',
              format: 'decimal'
            },
            dueDate: {
              type: 'string',
              format: 'date-time'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Repayment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            loanRequestId: {
              type: 'string',
              format: 'uuid'
            },
            amount: {
              type: 'number',
              format: 'decimal'
            },
            paymentDate: {
              type: 'string',
              format: 'date-time'
            },
            paymentMethod: {
              type: 'string',
              enum: ['cash', 'bank_transfer', 'upi', 'cheque', 'other']
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'disputed']
            },
            transactionReference: {
              type: 'string'
            },
            remarks: {
              type: 'string'
            }
          }
        },
        Report: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            reporterId: {
              type: 'string',
              format: 'uuid'
            },
            reportedUserId: {
              type: 'string',
              format: 'uuid'
            },
            loanRequestId: {
              type: 'string',
              format: 'uuid'
            },
            reportType: {
              type: 'string',
              enum: ['fraud', 'harassment', 'non_payment', 'false_information', 'inappropriate_behavior', 'other']
            },
            description: {
              type: 'string'
            },
            status: {
              type: 'string',
              enum: ['pending', 'under_review', 'resolved', 'dismissed']
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            userId: {
              type: 'string',
              format: 'uuid'
            },
            type: {
              type: 'string',
              enum: ['loan_request', 'loan_accepted', 'loan_rejected', 'loan_fulfilled', 'payment_reminder', 'payment_received', 'payment_overdue', 'report_filed', 'report_resolved', 'account_blocked', 'account_unblocked', 'general']
            },
            title: {
              type: 'string'
            },
            message: {
              type: 'string'
            },
            isRead: {
              type: 'boolean'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js', './docs/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
