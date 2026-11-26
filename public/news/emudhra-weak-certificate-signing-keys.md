# eMudhra certificate compromise: how a signing key became the number 4

Buying a domain gives a website its address. To serve it over **HTTPS**, the owner or hosting provider also obtains a digital certificate from a **certificate authority (CA)**. When someone visits, a browser such as Firefox checks that certificate to help establish that it has reached the right server.

**eMudhra is one of those certificate authorities. Eight of its signing keys were found to be so weak that outsiders could recover them almost instantly. One was simply 4.** With those secrets, an attacker could manufacture certificates for websites they did not own.

That is why Mozilla, the maker of Firefox, intervened. It received the report on **October 17, 2026**, and blocked the affected certificates in Firefox within three hours. The failure was at an organization trusted to certify websites; Firefox's response was to withdraw that trust.

## From buying a domain to opening it in Firefox

Suppose someone registers a domain for an online shop and connects it to their hosting service. Registration establishes control of the name, while DNS—the internet's address lookup system—directs visitors to a server. Neither step alone proves to a browser that the server answering is entitled to represent that domain.

For HTTPS, the shop or its host requests a certificate. The CA checks control of the domain, for example through a temporary DNS record, then issues a signed certificate naming the domain and containing the website's **public key**. Hosting platforms often automate this, so the owner may never contact the CA directly.

When a customer opens the shop in Firefox, the server presents its certificate and proves it holds the matching **private key**. Firefox checks the domain name, validity and signatures, along with its other security requirements, before accepting the connection.

> **What does the certificate prove?** It links a domain name to a public key under an issuer's signature. It helps authenticate the server; it does not promise that the business is honest or that its website is free of malware.

The registrar, CA and browser have different jobs: registering the name, certifying a key for that name, and checking the certificate when someone connects.

## The secret that failed belonged to the issuer

The website and its CA have **separate key pairs**. A private key produces a digital signature; the corresponding public key lets others verify it.

| Key pair | What the private key does | Who verifies the result? |
| --- | --- | --- |
| Website's pair | Proves the server controls the key named in its certificate | The connecting browser |
| CA's pair | Signs certificates for websites | Browsers that trust the issuing authority |

The CA can sign many certificates with the same signing key. Losing that secret therefore affects more than one website: someone else can produce signatures that appear to come from the issuer.

> **Why would Firefox trust eMudhra?** Browsers maintain trusted root certificates. A root can authorize an intermediate CA to issue website certificates beneath it. Firefox checks that chain. The affected eMudhra keys belonged to intermediate issuers—six for HTTPS and two for signing software.

For the shop, the distinction matters. An attacker would not need its real private key. They could create a certificate naming the shop's domain, insert **their own public key**, and sign the certificate with the recovered CA key. They already possess the matching private key needed to answer as that server.

This bypasses the CA's normal domain-control checks: the attacker signs the certificate themselves instead of asking the CA to issue it.

## Why the signing keys were recoverable

eMudhra's affected keys used **P-384**, a cryptographic system whose private key should be an unpredictable number from an enormous permitted range. Instead, all eight secrets were **below 256**.

Researcher Scott Helme independently recovered values including 4, 56 and 115 in less than a second. Testing a small set of candidate secrets against the public keys revealed the matches. Publishing public keys is normal; the failure was choosing secrets that were so easy to find.

These were **valid-looking certificates backed by weak secrets**. Their format did not reveal the problem through ordinary structural checks. The social-media explanation that someone read “384-bit” as “pick 1–384” remains speculation.

In eMudhra's preliminary account, its setup process first generated proper keys. A script flaw during a protected key-export test created weak alternatives, and similar labels led staff to select the wrong keys for certification. The root then certified those public keys, giving the weak secrets intermediate signing authority.

The flowchart shows where that setup failed, before any visitor connected to a website.

![eMudhra's preliminary sequence: proper keys are generated, a script creates weak alternatives, staff select the wrong pair, the root certifies those public keys, and outsiders can recover the signing secrets from public information.](/news/assets/emudhra-weak-certificate-signing-keys/issuance-failure.svg)

The keys were held in a **hardware security module (HSM)**, a device designed to protect cryptographic secrets. That protection could not stop someone guessing the secret from public information. The precise code-level cause remained under investigation.

## What could happen to a visitor?

A forged certificate alone does not bring a customer to the attacker's server. The attacker also needs to intercept or redirect the connection, and the customer's browser or application must accept the affected certificate chain and pass its other checks.

If those conditions hold, someone opening the shop could reach an impostor presenting an apparently valid certificate for the same domain. The diagram follows that possible attack, including the point where a client can reject it.

![A visitor opens the shop; an attacker intercepts the connection and presents a certificate containing the attacker's public key, signed with the recovered CA key. The client either rejects the compromised authority or accepts the impostor and sends its request.](/news/assets/emudhra-weak-certificate-signing-keys/connection-trust-check.svg)

HTTPS encryption could still operate, but **the encrypted connection would end at the attacker**. The impostor could read submitted information or relay altered requests onward. Depending on the application, that could expose passwords, session tokens or other sensitive data.

The CA signing key does not itself decrypt previously recorded modern HTTPS traffic or reveal the real shop's private key. The danger here is impersonation. Recovering the keys demonstrates that capability; it does not establish that customers' sessions were intercepted.

## Why Firefox could block it—and why cleanup goes further

Mozilla's block told Firefox to reject the affected authority, even if a certificate's signature otherwise checked out. It later shipped browser updates for configurations that might have missed the block and removed the relevant root from its certificate library. eMudhra revoked the affected certificates.

**Revocation means a certificate should no longer be trusted.** Software must receive and enforce that decision for it to help. Other applications may use their own certificate bundles or libraries, so a Firefox fix does not automatically protect every backend service or device.

Users should keep browsers and operating systems updated; application operators also need the relevant updates to their TLS libraries and trust stores. TLS is the protocol that secures HTTPS connections.

The shop can still own its domain and protect its private key while a compromised issuer lets someone else claim the same identity. That is the reach of this failure—and why removing the issuer's authority matters as much as correcting its key-generation process.

## Sources

- [Mozilla's October 20 disclosure](https://blog.mozilla.org/security/2026/10/20/protecting-firefox-users-following-the-compromise-of-emudhra-intermediate-certificates/): the incident and Firefox's response.
- [Mozilla incident record, comments 5 and 11](https://bugzilla.mozilla.org/show_bug.cgi?id=2083449): key recovery and eMudhra's preliminary explanation.
- [Scott Helme's investigation](https://scotthelme.co.uk/eight-bits-of-trust-emudhras-ca-keys-cracked-in-milliseconds/): recovered values and the weakness of the secrets.
- [Let's Encrypt: how certificate issuance works](https://letsencrypt.org/how-it-works/): domain validation and certificate requests.
- [TLS 1.3: authentication](https://www.rfc-editor.org/rfc/rfc8446.html#section-4.4): certificates and proof of private-key possession.

*Checked October 21, 2026. The root-cause account remains preliminary.*
