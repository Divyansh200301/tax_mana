const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5501;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/tax_management_db', {
    useNewUrlParser: true, // useNewUrlParser is deprecated, but still included for backward compatibility
    useUnifiedTopology: true // useUnifiedTopology is recommended for removing deprecation warnings
})
.then(() => {
    console.log('Connected to MongoDB!');
})
.catch((err) => {
    console.error('MongoDB connection error:', err.message);
});

// Mongoose Schema for User
const userSchema = new mongoose.Schema({
    panNumber: String,
    aadharNumber: String,
    fullName: String,
    locality: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// Mongoose Schema for Tax Saving Details
const taxSavingSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    standardDeduction: Number,
    section80C: Number,
    section80D: Number,
    otherIncome: Number,
    taxSavingInvestments: Boolean,
    investForTaxSaving: Boolean,
    medicalInsurance: Boolean,
    homeLoan: Boolean,
    educationalLoan: Boolean,
    dependents: Boolean,
    retirementSavings: Boolean,
    disability: Boolean,
    npsContribution: Boolean
});

const TaxSavingDetails = mongoose.model('TaxSavingDetails', taxSavingSchema);

// User Registration Endpoint
app.post('/register', (req, res) => {
    const { panNumber, aadharNumber, fullName, locality, password } = req.body;

    const newUser = new User({ panNumber, aadharNumber, fullName, locality, password });
    
    newUser.save()
        .then(() => {
            res.status(201).json({ message: 'User registered successfully' });
        })
        .catch((err) => {
            console.error('Error registering user:', err.message);
            res.status(500).json({ error: 'Error registering user' });
        });
});

// Tax Saving Details Submission Endpoint
app.post('/tax-saving-details', (req, res) => {
    const {
        userId,
        standardDeduction,
        section80C,
        section80D,
        otherIncome,
        taxSavingInvestments,
        investForTaxSaving,
        medicalInsurance,
        homeLoan,
        educationalLoan,
        dependents,
        retirementSavings,
        disability,
        npsContribution
    } = req.body;

    const newTaxSavingDetails = new TaxSavingDetails({
        userId,
        standardDeduction,
        section80C,
        section80D,
        otherIncome,
        taxSavingInvestments,
        investForTaxSaving,
        medicalInsurance,
        homeLoan,
        educationalLoan,
        dependents,
        retirementSavings,
        disability,
        npsContribution
    });

    newTaxSavingDetails.save()
        .then(() => {
            res.status(201).json({ message: 'Tax saving details saved successfully' });
        })
        .catch((err) => {
            console.error('Error saving tax saving details:', err.message);
            res.status(500).json({ error: 'Error saving tax saving details' });
        });
});

// Tax Calculation Endpoint
app.post('/calculate-tax', (req, res) => {
    const { totalIncome, deductions, taxRegime } = req.body;

    // Tax calculation logic based on tax regime
    let taxAmount = 0;
    if (taxRegime === 'old') {
        if (totalIncome <= 250000) {
            taxAmount = 0;
        } else if (totalIncome <= 500000) {
            taxAmount = 0.05 * (totalIncome - 250000);
        } else if (totalIncome <= 1000000) {
            taxAmount = 12500 + 0.2 * (totalIncome - 500000);
        } else {
            taxAmount = 112500 + 0.3 * (totalIncome - 1000000);
        }
    } else if (taxRegime === 'new') {
        if (totalIncome <= 250000) {
            taxAmount = 0;
        } else if (totalIncome <= 500000) {
            taxAmount = totalIncome * 0.05;
        } else if (totalIncome <= 750000) {
            taxAmount = totalIncome * 0.1;
        } else if (totalIncome <= 1000000) {
            taxAmount = totalIncome * 0.15;
        } else if (totalIncome <= 1250000) {
            taxAmount = totalIncome * 0.2;
        } else if (totalIncome <= 1500000) {
            taxAmount = totalIncome * 0.25;
        } else {
            taxAmount = totalIncome * 0.3;
        }
    }

    res.status(200).json({ taxAmount });
});

// Tax Suggestion Endpoint
app.post('/tax-suggestion', (req, res) => {
    const { job, annualIncome, age, taxSavingInvestments, investForTaxSaving, medicalInsurance, homeLoan, educationalLoan, dependents, retirementSavings, disability, npsContribution } = req.body;

    // Determine tax regime suggestion
    let suggestion = '';
    let oldRegimeBeneficial = true;

    if (annualIncome > 1000000 || age > 60) {
        oldRegimeBeneficial = false;
    }

    if (homeLoan && educationalLoan && dependents) {
        oldRegimeBeneficial = false;
    }

    if (oldRegimeBeneficial) {
        suggestion = 'Based on your input, the Old Tax Regime may be more beneficial.';
    } else {
        suggestion = 'Based on your input, the New Tax Regime may be more beneficial.';
    }

    res.status(200).json({ suggestion });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
