# FLC Shadow Exam Demo

## What This Is

This is a private static proof-of-concept for one FLC exam workflow outside Thinkific.

It demonstrates:

- FLC-style course page
- student registration
- fake checkout
- exam unlock
- automatic grading
- pass/fail result
- Betty/admin verification view

## How To Test

Open `index.html` or host this folder on a private server.

Use the built-in **Guided Demo** button for the walkthrough.

### Fake Payment Cards

Success:

`4242 4242 4242 4242`

Decline:

`4000 0000 0000 0002`

No payment data is sent anywhere. This is a front-end-only sandbox.

## Boss Clear Condition

A fake student can:

1. Register.
2. Complete fake payment.
3. Unlock the exam.
4. Submit the exam.
5. Receive a score and pass/fail result.
6. Appear in the admin view.

## Boundaries

This is not production.

This does not connect to Stripe, Thinkific, MBON, or any live FLC system.

This should not be published publicly with real exam content unless FLC approves that exposure.

For ordinary GitHub Pages, treat the site as public unless private Pages access control is actually available.

## Current Source

Exam source: `QUIZ: Chapter 1 Section 1` Google Form.

The form is represented as one five-question, 100-point private demo exam.

Before using this as an official grading authority, verify the answer key against the Google Form answer key.
