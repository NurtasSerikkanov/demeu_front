import React, { useState, useEffect, useRef } from "react";
import styles from "./EditPostPopup.module.scss";
import IconSvg from "../../shared/assets/icons/Icon";
import { useTranslation } from "react-i18next";
import { usePublicationsStore } from "../../store/publicationStore";
import { Image } from "../../store/publicationStore";

const EditPostPopup: React.FC<EditPostPopupProps> = ({ post, onClose, onSave }) => {
    const { t } = useTranslation();
    const { editPublication } = usePublicationsStore();

    const [formData, setFormData] = useState<PostData>({
        title: post?.title || "",
        category: post?.category || "",
        description: post?.description || "",
        amount: post?.amount || "",
        bank_details: post?.bank_details || "",
        contact_name: post?.contact_name || "",
        contact_email: post?.contact_email || "",
        contact_phone: post?.contact_phone || "",
        images: post?.images || [],
    });
    const categoryTranslations = t("categories_list", { returnObjects: true });

    const translatedCategory = formData.category && categoryTranslations[formData.category]
        ? categoryTranslations[formData.category]
        : t("chooseCategory");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const getImageUrl = (image: Image | File | string | undefined | null) => {
        if (!image) return null;

        if (typeof image === "string") {
            return image.startsWith("http") ? image : `http://127.0.0.1:8000${image}`;
        }

        if (typeof image === "object" && "image" in image && typeof image.image === "string") {
            return image.image.startsWith("http") ? image.image : `http://127.0.0.1:8000${image.image}`;
        }

        if (image instanceof File) {
            return URL.createObjectURL(image);
        }
        return null;
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);

        const validFiles = files.filter(file => file.type.startsWith("image/"));
        console.log(formData)
        console.log(validFiles)
        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...validFiles], // Добавляем только валидные фото
        }));
        console.log(formData)
    };

    const [deletedImages, setDeletedImages] = useState<Set<number>>(new Set());

    // 🟢 Обработчик удаления фото
    const handleDeleteImage = (index: number) => {
        setFormData((prev) => {
            const newImages = [...prev.images];
            const removedImage = newImages[index];

            if (typeof removedImage === "object" && "id" in removedImage) {
                setDeletedImages((prevDeleted) => new Set([...prevDeleted, removedImage.id])); // Добавляем id в список удаленных
            }

            newImages.splice(index, 1);
            return { ...prev, images: newImages };
        });
    };

    useEffect(() => {
        console.log(formData.images)
        // setDeletedImages(new Set());
    }, [formData.images]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formDataToSend = new FormData();

        const existingImages: string[] = [];

        formData.images.forEach((img) => {
            console.log(img, "else last")
            if (img instanceof File) {
                console.log(img, "sdfsdfsdfasdfds")
                formDataToSend.append("uploaded_images", img);
                console.log(formDataToSend, "11111111111")
            } else if (typeof img === "object" && "image" in img && !deletedImages.has(img.id)) {
                existingImages.push(img.image);
            }
        });
        // console.log(formData)
        // console.log(existingImages)
        console.log(formDataToSend)
        //
        // console.log("📡 Отправка запроса на сервер:");
        // console.log("🔹 existing_images:", existingImages);
        // console.log("🔹 deleted_images:", Array.from(deletedImages)); // ✅ Логируем удаленные фото перед отправкой

        existingImages.forEach((image) => formDataToSend.append("existing_images", image));
        formDataToSend.append("deleted_images", JSON.stringify(Array.from(deletedImages))); // ✅ Передаем `deletedImages` как JSON

        Object.keys(formData).forEach((key) => {
            if (key !== "images") {
                formDataToSend.append(key, formData[key as keyof PostData]);
            }
        });

        // console.log(formDataToSend.images)

        try {
            const updatedPost = await editPublication(post.id, formDataToSend);

            // setFormData((prev) => ({
            //     ...prev,
            //     images: updatedPost.images || [],
            // }));

            setDeletedImages(new Set()); // ✅ Очищаем список удаленных фото после успешного обновления

            onClose();
        } catch (error) {
            console.error("Ошибка обновления публикации:", error);
        }
    };

    return (
        <div className={styles.popupOverlay}>
            <div className={styles.popup}>
                <div className={styles.header}>
                    <h2>{t("updatePost")}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <IconSvg name="closeIcon" width="25px" height="25px" />
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <label className={styles.label}>{t("title")}</label>
                    <div className={styles.inputWrapper}>
                        <IconSvg name="textIcon" width="20px" height="20px" />
                        <input
                            className={styles.input}
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <label className={styles.label}>{t("category")}</label>
                    <div className={`${styles.categorySelectWrapper} ${styles.disabledCategory}`}>
                        <div className={styles.categorySelect}>
                            <IconSvg name="categoryIcon" className={styles.categoryIcon} width="20px" height="20px" />
                            <span className={styles.categoryText}>{translatedCategory}</span>
                        </div>
                    </div>

                    <label className={styles.label}>{t("upload_images")}</label>
                    <div className={styles.imageContainer}>
                        {formData.images.map((img, index) => {
                            const imageUrl = getImageUrl(img);
                            return imageUrl ? (
                                <div key={index} className={styles.imageWrapper}>
                                    <img src={imageUrl} alt="Preview" className={styles.imagePreview} />
                                    <button
                                        type="button"
                                        className={styles.deleteImage}
                                        onClick={() => handleDeleteImage(index)}
                                    >
                                        ✖
                                    </button>
                                </div>
                            ) : null;
                        })}

                        {/* Кнопка добавления нового фото */}
                        <label className={styles.addImage}>
                            <IconSvg name="cameraIcon" width="40px" height="40px" />
                            <input type="file" accept="image/*" onChange={handleImageUpload} className={styles.fileInput} />
                        </label>
                    </div>

                    {/* Описание */}
                    <label className={styles.label}>{t("description")}</label>
                    <div className={styles.descriptionWrapper}>
                        <IconSvg name="descriptionIcon" className={styles.descriptionIcon} width="20px" height="20px" />
                        <textarea
                            className={styles.descriptionTextarea}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Сумма */}
                    <label className={styles.label}>{t("amount")}</label>
                    <div className={styles.inputWrapper}>
                        <IconSvg name="moneyIcon" width="20px" height="20px" />
                        <input
                            className={styles.input}
                            name="amount"
                            type="number"
                            value={formData.amount}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Банк */}
                    <label className={styles.label}>{t("bank_details")}</label>
                    <div className={styles.inputWrapper}>
                        <IconSvg name="cardIcon" width="20px" height="20px" />
                        <input
                            className={styles.input}
                            name="bank_details"
                            value={formData.bank_details}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Контактное лицо */}
                    <label className={styles.label}>{t("contact_name")}</label>
                    <div className={styles.inputWrapper}>
                        <IconSvg name="userIcon" width="20px" height="20px" />
                        <input
                            className={styles.input}
                            name="contact_name"
                            value={formData.contact_name}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Email */}
                    <label className={styles.label}>{t("contact_email")}</label>
                    <div className={styles.inputWrapper}>
                        <IconSvg name="emailIcon" width="20px" height="20px" />
                        <input
                            className={styles.input}
                            type="email"
                            name="contact_email"
                            value={formData.contact_email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Телефон */}
                    <label className={styles.label}>{t("contact_phone")}</label>
                    <div className={styles.inputWrapper}>
                        <IconSvg name="phoneicon" width="20px" height="20px" />
                        <input
                            className={styles.input}
                            type="tel"
                            name="contact_phone"
                            value={formData.contact_phone}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className={styles.submitButton}>{t("save")}</button>
                </form>
            </div>
        </div>
    );
};

export default EditPostPopup;
