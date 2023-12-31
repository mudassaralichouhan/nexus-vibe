
import path from "path"
import fs from "fs"

export const uploadImage = async (directory, image) => {
    const originalFileName = image.name;
    const fileExtension = originalFileName.split('.').pop();
    const fileName = generateRandomName() + '.' + fileExtension;

    const uploadPath = path.join(__dirname, '..', 'public/uploads', directory, fileName)

    try {
        await fs.promises.mkdir(path.dirname(uploadPath), { recursive: true });

        await image.mv(uploadPath);

        return `/${directory}/${fileName}`;
    } catch (error) {
        console.error("Error creating directories:", error);
        throw error;
    }
};

function generateRandomName() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomName = '';

    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomName += characters.charAt(randomIndex);
    }

    return randomName;
}
