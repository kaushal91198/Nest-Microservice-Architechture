import { CategoryRepository } from "../repositories/category.repository";

export async function addCategories(categoryRepository: CategoryRepository) {
    const categories = [
        { name: "Earphone" },
        { name: "Headphone" },
        { name: "Watch" },
        { name: "Smartphone" },
        { name: "Laptop" },
        { name: "Camera" },
        { name: "Accessories" }
    ];
    const existingCategories = await categoryRepository.find({})
    console.log(existingCategories, "bhghj")
    if (existingCategories.length === 0) {
        await categoryRepository.insertMany(categories);
    }
}