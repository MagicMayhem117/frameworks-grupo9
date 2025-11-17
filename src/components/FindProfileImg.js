import { PROFILE_IMAGES } from "../components/ProfileImages.js"

export function findProfile(profile){
    if (profile == "perfil1") {
        return PROFILE_IMAGES.perfil1.uri;
    } else if (profile == 'perfil2') {
        return PROFILE_IMAGES.perfil2.uri;
    } else if (profile == 'perfil3') {
        return PROFILE_IMAGES.perfil3.uri;
    } else if (profile == 'perfil4') {
        return PROFILE_IMAGES.perfil4.uri;
    } else if (profile == 'perfil5') {
        return PROFILE_IMAGES.perfil5.uri;
    } else if (profile == 'perfil6') {
        return PROFILE_IMAGES.perfil6.uri;
    } else if (profile == 'perfil7') {
        return PROFILE_IMAGES.perfil7.uri;
    } else if (profile == 'perfil8') {
        return PROFILE_IMAGES.perfil8.uri;
    } else if (profile == 'perfil9') {
        return PROFILE_IMAGES.perfil9.uri;
    }
} 