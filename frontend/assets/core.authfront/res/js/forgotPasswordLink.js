export function isSafeForgotPasswordExternalLink(link) {
	if (!link) {
		return false;
	}

	try {
		const parsed = new URL(link);
		return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && !!parsed.host;
	} catch {
		return false;
	}
}

export function resolveForgotPasswordNavigation(externalLink, forgotPasswordAction = 'reset-password-ask') {
	if (isSafeForgotPasswordExternalLink(externalLink)) {
		return { type: 'external-link', value: externalLink };
	}

	return { type: 'action', value: forgotPasswordAction };
}
