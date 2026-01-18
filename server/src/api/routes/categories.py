from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile

from src.services.menu_service import MenuService
from src.api.dependencies import get_category_service, get_current_user, get_menu_service, get_venue_service
from src.services.category_service import CategoryService
from src.services.venue_service import VenueService
from src.schemas.menu import CategoryCreate, CategoryRead, CategoryUpdate
from fastapi import UploadFile, File, Form, HTTPException
from typing import List


router = APIRouter(prefix="/venues/{venue_id}/menus/{menu_id}/categories", tags=["Category"])

@router.post("/", response_model=List[CategoryRead], status_code=status.HTTP_201_CREATED)
async def create_category(
    venue_id: str,  
    menu_id: str,  
    name: str = Form(...),
    image_file: UploadFile = File(None),
    position: int = Form(1),
    current_user: dict = Depends(get_current_user),
    vs: VenueService = Depends(get_venue_service),
    ms: MenuService = Depends(get_menu_service),
    cs: CategoryService = Depends(get_category_service)
):
    if not current_user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED")

    venue = await vs.get_venue_by_id_for_owner(venue_id=venue_id, owner_id=current_user["sub"])
    if not venue:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This venue is not yours")

    menu = await ms.get_menu_by_id(menu_id, venue_id) 
    if not menu:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Menu not found or access denied")

    image_bytes = None
    if image_file and image_file.file and image_file.size > 0:
        image_bytes = await image_file.read()
    data = CategoryCreate(name=name, image_bytes=image_bytes, position=position)
  
    await cs.create_category(menu_id, data)
    return await cs.get_categories(menu_id)

@router.delete("/{category_id}", response_model=List[CategoryRead], status_code=status.HTTP_202_ACCEPTED)
async def delete_category_by_id(
    venue_id: str,
    menu_id: str,
    category_id: str,
    current_user: dict = Depends(get_current_user),
    vs: VenueService = Depends(get_venue_service),
    cs: CategoryService = Depends(get_category_service)
):
    if not current_user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED")

    venue = await vs.get_venue_by_id_for_owner(venue_id=venue_id, owner_id=current_user["sub"])
    if not venue:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This venue is not yours")
    
    await cs.delete_category(venue_id, menu_id, category_id)
    return await cs.get_categories(menu_id)


@router.patch("/{category_id}")
async def update_category(
    venue_id: str,
    menu_id: str,
    category_id: str,
    name: Optional[str] = Form(None),
    position: Optional[int] = Form(None),
    new_menu_id: Optional[str] = Form(None),
    image_file: UploadFile = File(None),
    current_user: dict = Depends(get_current_user),
    vs: VenueService = Depends(get_venue_service),
    cs: CategoryService = Depends(get_category_service),
    ms: MenuService = Depends(get_menu_service)
):
    if not current_user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED)

    venue = await vs.get_venue_by_id_for_owner(venue_id=venue_id, owner_id=current_user["sub"])
    if not venue:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This venue is not yours")

    new_menu = await ms.get_menu_by_id(new_menu_id, venue_id)
    if new_menu_id and not new_menu:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "This menu doesn't exist")

    image_bytes = None
    if image_file and image_file.file and image_file.size > 0:
        image_bytes = await image_file.read()
    data = CategoryUpdate(name=name, image_bytes=image_bytes, position=position, menu_id=new_menu_id)
    
    await cs.update_category(data, menu_id, category_id)
    if data.menu_id:
        return await cs.get_categories(data.menu_id)
    else:
        return await cs.get_categories(menu_id)