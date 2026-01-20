from supabase import Client


class ImageHandler:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    def get_clean_file_paths(self, image_paths: list[str]) -> list[str]:
        file_paths = []
        default_icons = {
            "breakfast.png", "burgers.png", "cocktails.png",
            "coffee.png", "desserts.png", "drinks.png",
            "salads.png", "tea.png"
        }
        
        for image_path in image_paths:
            if image_path:
                clean_path = image_path.strip("[]").lstrip("/")
                filename = clean_path.split("/")[-1]
                if filename not in default_icons:
                    file_paths.append(clean_path)
        
        return file_paths

    async def delete_non_default_images(self, file_paths: list[str]) -> None:
        print(file_paths)
        if not file_paths:
            return
            
        try:
            print("Remove")
            self.supabase.storage.from_("images").remove(file_paths)
        except Exception as e:
            print(f"Storage delete ignored: {e}")
            pass

    async def upload_image(self, image_bytes: bytes | None, file_path: str) -> str:
        if not image_bytes:
            return ""
        
        try:
            self.supabase.storage.from_("images").upload(file_path, image_bytes)
        except Exception as e:
            if "already exists" in str(e).lower():
                self.supabase.storage.from_("images").remove([file_path])
                self.supabase.storage.from_("images").upload(file_path, image_bytes)
            else:
                raise
        
        return file_path