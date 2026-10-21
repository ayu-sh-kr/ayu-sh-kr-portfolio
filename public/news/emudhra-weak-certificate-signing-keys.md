# eMudhra certificate compromise: how a signing key became the number 4

One of eMudhra's certificate-signing private keys was **4**. A secret meant to be practically impossible to recover could instead be found almost immediately from public information.

Mozilla disclosed the compromise on **October 20, 2026**, after receiving a report on October 17. Eight intermediate certificate-authority keys were affected: six for HTTPS certificates and two for code signing. The failure began in key generation, before any attacker needed to steal a secret.

> **Terminology — certificate authority and intermediate:** A certificate authority, or CA, signs digital certificates that associate an identity with a public key. A trusted root can authorize an intermediate CA to issue certificates beneath it. Compromising an intermediate's signing key can therefore affect trust in many identities, rather than one website.

## What the signing keys needed to be

These keys used **P-384**, an elliptic-curve cryptographic system. Its private key is a secret integer chosen unpredictably from a huge permitted range. The corresponding public key can be shared so others can verify signatures without learning the secret.

For a website certificate, the CA signs the certificate's contents with its private key. A client checks that signature and the chain leading back to a trusted root. Imagine an application contacting a payment API: this check helps establish that the server presenting the certificate represents the requested hostname.

> **Terminology — signing and encryption:** A signing key proves who authorized a statement. It does not directly encrypt every HTTPS message. This incident undermined server authentication: whether the endpoint on the other side could be trusted.

The requirement was unpredictable key material across the proper range. “384-bit” does not mean choosing a number between 1 and 384, nor does security depend on having exactly 116 decimal digits.

## What was actually produced

All eight affected secrets were **below 256**. Security researcher Scott Helme independently recovered values including 4, 56 and 115 in less than a second.

The public keys were structurally valid. That distinction explains why describing them as “malformed certificates” misses the central failure: normal format checks could pass even though the secrets were trivially guessable.

| Requirement | Observed result | Consequence |
| --- | --- | --- |
| Unpredictable secret across P-384's permitted range | Every affected secret fit in one byte | A tiny candidate search could recover it |
| Public key safe to distribute | Valid public key derived from a weak secret | Public certificates exposed enough information to identify the secret |
| Signing authority restricted to its operator | Recoverable intermediate signing keys | Others could manufacture signatures under that authority |

This comparison explains the failure; it is not an independent test of eMudhra's infrastructure.

## Why the weak keys were selected

In its **preliminary incident account**, eMudhra says its ceremony first generated proper keys inside a hardware security module. A deviation to test exporting protected keys introduced a script flaw that created a second, weaker set.

Similar labels then led staff to select those weak keys for certificate-signing requests. The root signed the requests, and copies also went to Sectigo for cross-signing.

> **Terminology — HSM and CSR:** A hardware security module, or HSM, protects cryptographic operations and key storage. A certificate-signing request, or CSR, asks an issuer to certify a public key. Protecting a weak key inside hardware cannot make the underlying secret harder to guess.

The precise code-level mistake remained under investigation. The viral claim that staff misunderstood “384-bit” as “pick 1–384” is speculation.

## What an attacker could do, and what was blocked

Recovered signing keys could let an attacker create a fraudulent HTTPS certificate. If the attacker could also intercept the payment application's connection, a client still trusting the affected chain might accept the impersonation and expose requests or responses.

**Key recovery alone does not redirect traffic or prove that customer data was stolen.**

Mozilla distributed Firefox blocks within three hours of receiving the report, then released additional browser and certificate-library updates. eMudhra revoked the affected certificates. Applications with separate trust stores need their own relevant updates; browser protection does not automatically protect a backend process.

> A valid certificate format cannot compensate for a guessable signing secret.

For the payment application, the immediate task is keeping its TLS trust components updated. For the certificate authority, the investigation must explain how weak replacement keys passed through generation, selection and approval into trusted certificates.

## Sources

- [Mozilla Security Blog, October 20](https://blog.mozilla.org/security/2026/10/20/protecting-firefox-users-following-the-compromise-of-emudhra-intermediate-certificates/): disclosure, interception risk and Firefox response.
- [Mozilla incident record, especially comments 5 and 11](https://bugzilla.mozilla.org/show_bug.cgi?id=2083449): independent confirmation and eMudhra's preliminary explanation.
- [Scott Helme's October 20 investigation](https://scotthelme.co.uk/eight-bits-of-trust-emudhras-ca-keys-cracked-in-milliseconds/): independently recovered key values and why valid public keys could conceal weak secrets.

*Checked October 21, 2026. The root-cause account remains preliminary.*
