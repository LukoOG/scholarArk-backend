export function ParseArray() {
  return ({ value }) => {
    if (typeof value === 'string') {
      console.log("raw value:", value)

      let cleaned = value.trim();
      if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
      }

      if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
        try {
          const parsed = JSON.parse(cleaned)
          return parsed
        } catch (err) {
          console.error("couldn't parse JSON", err)
          return []
        }
      }
    }

    return value
  }
}
