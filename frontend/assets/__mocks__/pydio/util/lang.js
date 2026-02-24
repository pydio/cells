export default {
	trim: (str, char) => {
		if (char) {
			const regex = new RegExp(`^[${char}]+|[${char}]+$`, 'g');
			return str.replace(regex, '');
		}
		return str.trim();
	}
};
