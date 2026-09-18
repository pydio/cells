# Security Policy

While there’s currently no bug bounty program in place, we appreciate every report (see [contact details](#reporting-a-vulnerability)).

## Security incident policy
Security bug reports are treated with special attention and are handled differently from normal bugs.
In particular, security sensitive bugs are not handled on public issue trackers on GitHub or other company-wide accessible tools but in a private bug tracker.
Information about the bug and access to it is restricted to people in the security team, the individual engineers that work on fixing it, and any other person who needs to be involved for organizational reasons.
The process is handled by the security team, which decides on the people involved in order to fix the issue.
It is also guaranteed that the person reporting the issue has visibility into the process of fixing it.
Any security issue gets prioritized according to its security rating.
The issue is opened up to the public in coordination with the release schedule and the reporter.
Security fixes are mentioned in the release notes in a separate section called "Security Fixes" and link to the advisory and/or issue.
The issue might not be public at the time of the release, depending on the agreed embargo time, but fully documents the issue and any fixes.

## Tracking security issues
Security issues are tracked on an internal vulnerabilities project that can only be accessed by a small number of people.
Once a security issue is triaged and the appropriate code repository is identified, a draft security advisory is created on the corresponding GitHub repository.
This gives the corresponding team access to the vulnerability and allows to involve all people necessary to fix the issue.
Once the issue has been fixed and the embargo ends the advisory is published to the GitHub advisory database.

## Vulnerability Approval Process
While working on security issues, it is important that we don’t disclose the issue to a wider audience prematurely.
It is therefore necessary that any commit related to security fixes should not obviously be identifiable as such.
Therefore tests pointing to the issue might be landed later, commit messages should be obscured, and comments and code should not refer to the issue in any obvious way.
Any security fix must be approved by the security team before it can be merged.
This ensures that the principles above are followed.

## Internal escalation path
When a security issue is identified and entered in the vulnerability tracker it first gets assessed by the security team.
After the assessment, the team leads who are responsible for the component where the vulnerability lies get involved.
Depending on the security rating, the CTO and CEO may get informed as well.
If the vulnerability is relevant to data protection laws, the data protection officer is also informed.

## Disclosure Policy
Everyone involved in the handling of a security issue - including the reporter - is expected to adhere to the following policy.
Any information related to a security issue must be treated as confidential and only shared with trusted partners if necessary, for example to coordinate a release or manage exposure of clients to the issue.
No information must be disclosed to the public before the embargo ends.
The embargo time is agreed upon by all involved parties.
It should be as short as possible without putting any users at risk.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 4.2.x   | ✅                 |
| 4.1.x   | ✅                 |
| 4.0.x   | ❌                 |
| < 4.0   | ❌                 |

## Reporting a Vulnerability
If you find a vulnerability in the code, please do not post an issue directly in Github or in the Forums, but use the contact information below.
Every vulnerability report will be assessed within 24 hours of receiving it.
If the outcome of the assessment is that the report describes a security issue, the report will be transferred into an issue on the internal vulnerability project for further processing.
The reporter is updated on each step of the process.
We commit to fixing any security issue that we rate “moderate” or higher within 90 days.

* Contact: [security@pydio.com](mailto:security@pydio.com)
* Encryption: [PGP Key](#pgp-key)

## Security Ratings
Every vulnerability is rated with one of the following four security levels:
* critical
* high
* moderate
* low

Security issues include but are not limited to:
* Remote code execution
* (Reflected) XSS
* CSRF
* TLS failure
* Authentication issues
* Memory corruption

### Critical security issues
Any critical security issue requires an immediate fix and subsequent point release.
An issue is critical if it is technically a high security issue that is known to be currently exploited or would put a high number of users at severe risk if being exploited.

### High security issues
An issue is marked as high if it is exploitable and would lead to compromise of user data.

### Moderate security issues
These issues are generally not as severe as high security issues because they require user interaction or require other additional circumstances/vulnerabilities to be exploitable.

### Low security issues
These issues have security implications but don’t have any (known) exploit path (or the exploit requires excessive resources, or is very limited in scope, or leaks insensitive information).

## PGP Key
```
-----BEGIN PGP PUBLIC KEY BLOCK-----
Comment: ECEA B749 BFAC AE02 EB2C  CF47 36F2 949A 5E1A 0711
Comment: Pydio Security <security@pydio.com>
Comment: Wire Security <vulnerability-report@wire.com>

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
64ULzPK14nz5mD++rS3VQR9K
=y3IY
-----END PGP PUBLIC KEY BLOCK-----