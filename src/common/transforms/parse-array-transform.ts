export function ParseArray() {
  return ({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : value;
      } catch {
        return value;
      }
    }
    return value;
  };
}
