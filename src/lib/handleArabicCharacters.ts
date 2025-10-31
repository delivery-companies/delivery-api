export const handleArabicCharacters = (message: string) => {
    let arabic = [];
    let english = [];

    const regex = /[\u0600-\u06ff]|[\u0750-\u077f]|[\ufb50-\ufc3f]|[\ufe70-\ufefc]/;

    arabic = message.split(" ").filter((e) => regex.test(e));
    english = message.split(" ").filter((e) => !regex.test(e));
    return `${english.join(" ")} ${arabic.reverse().join("  ")}`;
};
