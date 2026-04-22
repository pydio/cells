export function isSafeForgotPasswordExternalLink(link) {
	if (!link) {
		return false;
	}

	try {
		const parsed = new URL(link);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}
