import api from "./axios";

export const getRestaurants = async () => {
    const response = await api.get("/restaurants");
    return response.data;
}

export const getRestaurant = async (id) =>{
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
}