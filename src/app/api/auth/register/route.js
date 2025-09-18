import * as usuarioController from '@/controllers/usuarioController';

export async function POST(request) {
    return usuarioController.create(request);
}