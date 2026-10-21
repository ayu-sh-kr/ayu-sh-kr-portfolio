# eMudhra certificate compromise: how a signing key became the number 4

Eight of eMudhra's certificate-authority signing keys were recoverable from public certificates. One was the number **4**. The consequence extended beyond eMudhra: someone recovering those keys could create certificates claiming to represent websites they did not own.

Mozilla received the report on **October 17, 2026**, and disclosed its response on October 20. The affected keys belonged to six HTTPS certificate issuers and two code-signing issuers. This article follows the HTTPS risk: how a secret held by a certificate authority could let an attacker impersonate a website to software that still trusted it.

The important starting point is **whose key failed**. These were eMudhra's signing keys. The incident did not require recovering each website's private key.

## What a CA signing key authorizes

A website certificate associates a domain name with a public key. A certificate authority, or **CA**, checks the applicant's authority over that domain and signs the certificate. A browser can then verify the CA's signature when deciding whether to accept the certificate.

There are two separate key pairs in that arrangement:

| Owner | Public key | Private key |
| --- | --- | --- |
| Website | Included in the website certificate | Held by the server or its protected key service; proves control during a connection |
| Issuing CA | Included in the CA's certificate | Signs website certificates; the same CA key can sign many certificates |

> **What is a key pair?** A private key is a secret used to produce a digital signature. Its mathematically related public key lets others verify that signature. Sharing the public key should not make the private key practically recoverable.

Consider an online shop. The CA signs a certificate saying, in effect, “this public key represents the shop's domain.” When someone connects, the shop separately proves it controls the matching private key. The CA's endorsement and the shop's proof answer different questions: who the key belongs to, and whether the server answering possesses it.

The issuing CA is usually an **intermediate**: its authority comes from a certificate signed by a root CA that the browser already trusts. The browser checks this chain of signatures. eMudhra does not carry the customer's shopping traffic; its earlier endorsement helps the browser judge the endpoint.

A compromised intermediate signing key therefore gives an attacker something more useful than access to one shop: the ability to manufacture certificates under that issuing authority.

## The keys looked valid, but their secrets were guessable

The affected eMudhra keys used **P-384**, an elliptic-curve cryptographic system. Its private key is a number selected unpredictably from an enormous permitted range. Its public key is derived from that number.

Instead, all eight secrets were **below 256**. Researcher Scott Helme independently recovered the values, including 4, 56 and 115, in less than a second. An outsider could try the tiny set of candidate secrets and identify which produced the public key in a certificate.

| What was required | What was found |
| --- | --- |
| An unpredictable secret from P-384's permitted range | Secrets small enough to fit in one byte |
| A public key safe to publish | A public key that made testing those few candidates easy |
| Signing authority kept with the CA | Signing secrets recoverable by outsiders |

The certificates were structurally valid. A correctly formatted public key can still be derived from an insecure secret. That is why “malformed certificate” is an incomplete description: **the weakness was in the private-key values**, even though their public certificates could pass format checks.

The viral explanation that someone interpreted “384-bit” as “choose 1–384” is speculation. The incident record provides a different preliminary account.

## How the weak keys became trusted

eMudhra says its setup process initially created proper keys inside a **hardware security module**, a device designed to protect keys and cryptographic operations. A script flaw during a test involving protected key export then created weak alternatives. Similar labels led staff to select the wrong keys for certification.

The root certified those public keys, granting the corresponding weak private keys intermediate signing authority. The first flowchart traces the failure before any customer connection began.

![eMudhra's preliminary sequence: generate proper keys, create weak alternatives through a script flaw, select the wrong keys, certify their public keys under the root, publish certificates, and allow outsiders to recover the signing secrets.](/news/assets/emudhra-weak-certificate-signing-keys/issuance-failure.svg)

> **Hardware protection has a limit.** An HSM can keep a stored secret from being extracted. If that secret is guessable from public information, an outsider can recover it without entering the device.

The precise code-level cause remained under investigation. The explanation establishes a sequence of generation and selection failures; it does not establish why the script produced those particular small numbers.

## How this could affect someone visiting a website

An attacker with the recovered CA key could create a new certificate naming the shop's domain but containing **the attacker's own public key**. The attacker already holds its matching private key, so can provide the server's proof during a connection. The real shop's private key remains separate.

HTTPS uses **TLS (Transport Layer Security)** to authenticate the server and protect the connection. For this to expose a customer, the attacker also needs the customer's connection to reach the impostor—for example, through interception or redirection on the network path. The client must still accept the affected certificate chain and satisfy its other validation requirements.

The second flowchart follows that possible attack. It separates the compromised signing authority from the additional network access and shows where distrust blocks the attempt.

![A user opens the shop; an attacker intercepting the connection presents a certificate naming the shop with the attacker's public key, signed using the recovered CA key. The client either rejects the affected authority or accepts the impostor and sends its request.](/news/assets/emudhra-weak-certificate-signing-keys/connection-trust-check.svg)

If accepted, HTTPS encryption can still work—between the customer and **the impostor**. The attacker receives readable requests at that endpoint and could relay or modify them. Depending on what the application sends, the exposed information could include login credentials, session tokens or submitted data.

> **Signing keys are not session keys.** The CA key signs certificates; the website key proves server control. Modern TLS establishes separate session keys to encrypt traffic. Recovering the CA key does not itself reveal the real website's private key or decrypt previously recorded modern TLS sessions.

This is a demonstrated ability to recover signing keys and a resulting impersonation risk. It is not, by itself, evidence that customers' shopping sessions were intercepted.

## Why revocation and updates both matter

Mozilla distributed Firefox blocks within three hours of receiving the report. It later released Firefox updates for configurations that might have missed that delivery and removed the relevant root from its certificate library. eMudhra revoked the affected certificates.

**Revocation withdraws trust in a certificate.** It only protects a client when that client obtains and enforces the relevant information. Applications using separate certificate libraries or trust collections need the corresponding updates too.

For users, the practical step is keeping browsers and operating systems updated. For application operators, it also means updating the TLS libraries and certificate bundles their software actually uses.

The failure began with a tiny secret at a trusted issuer. Its reach came from what that secret could authorize: a convincing endorsement for an impostor's key. Removing that authority from clients is what prevents a forged endorsement from becoming a trusted connection.

## Sources

- [Mozilla Security Blog, October 20](https://blog.mozilla.org/security/2026/10/20/protecting-firefox-users-following-the-compromise-of-emudhra-intermediate-certificates/): disclosure, interception risk and Firefox response.
- [Mozilla incident record, especially comments 5 and 11](https://bugzilla.mozilla.org/show_bug.cgi?id=2083449): independent confirmation and eMudhra's preliminary explanation.
- [Scott Helme's October 20 investigation](https://scotthelme.co.uk/eight-bits-of-trust-emudhras-ca-keys-cracked-in-milliseconds/): independently recovered key values and the effect of weak secrets.

- [TLS 1.3 specification, authentication messages](https://www.rfc-editor.org/rfc/rfc8446.html#section-4.4): certificate verification and the server's separate proof of private-key possession.

*Checked October 21, 2026. The root-cause account remains preliminary.*
