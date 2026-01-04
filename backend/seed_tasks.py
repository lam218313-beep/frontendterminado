"""
Script para crear 10 tareas de prueba para el cliente demo.
"""
import requests

API_URL = "http://localhost:8000"

def main():
    # Login como admin
    login = requests.post(f'{API_URL}/token', data={'username': 'admin@pixely.com', 'password': 'admin123'})
    if login.status_code != 200:
        print(f"Error login: {login.text}")
        return
    
    token = login.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # Obtener clientes
    clients = requests.get(f'{API_URL}/semantic/clients', headers=headers).json()
    print(f'Clientes encontrados: {len(clients)}')

    # Buscar el cliente demo
    client_id = None
    for c in clients:
        nombre = c.get('nombre', '')
        if 'Demo' in nombre or 'Marca' in nombre:
            client_id = c['id']
            print(f'Cliente encontrado: {nombre} ({client_id})')
            break

    if not client_id and clients:
        client_id = clients[0]['id']
        print(f'Usando primer cliente: {client_id}')

    if not client_id:
        print('No se encontro cliente')
        return

    # Crear 10 tareas de prueba (formato correcto del schema)
    tareas = [
        {'title': 'Responder comentarios negativos', 'description': 'Atender quejas sobre tiempo de envio en Instagram', 'prioridad': 1, 'week': 1, 'urgencia': 'CRITICA', 'area_estrategica': 'Reputacion'},
        {'title': 'Crear contenido para TikTok', 'description': 'Desarrollar 3 videos cortos sobre nuevos productos', 'prioridad': 2, 'week': 1, 'urgencia': 'ALTA', 'area_estrategica': 'Contenido'},
        {'title': 'Analizar competencia', 'description': 'Revisar estrategia de redes de competidores principales', 'prioridad': 3, 'week': 2, 'urgencia': 'MEDIA', 'area_estrategica': 'Estrategia'},
        {'title': 'Contactar influencer @foodielover', 'description': 'Proponer colaboracion detectada en Q5', 'prioridad': 1, 'week': 1, 'urgencia': 'ALTA', 'area_estrategica': 'Influencers'},
        {'title': 'Actualizar bio de Instagram', 'description': 'Incluir nuevo hashtag de campana', 'prioridad': 4, 'week': 2, 'urgencia': 'BAJA', 'area_estrategica': 'Branding'},
        {'title': 'Programar posts semana 2', 'description': 'Calendario de contenido para proxima semana', 'prioridad': 2, 'week': 1, 'urgencia': 'ALTA', 'area_estrategica': 'Contenido'},
        {'title': 'Revisar metricas Q4 2025', 'description': 'Preparar reporte trimestral de engagement', 'prioridad': 3, 'week': 2, 'urgencia': 'MEDIA', 'area_estrategica': 'Analytics'},
        {'title': 'Responder DMs pendientes', 'description': '15 mensajes sin responder desde hace 48h', 'prioridad': 1, 'week': 1, 'urgencia': 'CRITICA', 'area_estrategica': 'Atencion'},
        {'title': 'Disenar nueva plantilla stories', 'description': 'Crear template reutilizable para promociones', 'prioridad': 4, 'week': 3, 'urgencia': 'BAJA', 'area_estrategica': 'Diseno'},
        {'title': 'Configurar anuncios Facebook', 'description': 'Lanzar campana de retargeting', 'prioridad': 2, 'week': 1, 'urgencia': 'ALTA', 'area_estrategica': 'Paid Media'},
    ]
    
    created = 0
    for t in tareas:
        r = requests.post(f'{API_URL}/api/v1/fichas/{client_id}/tasks', json=t, headers=headers)
        if r.status_code in [200, 201]:
            print(f'✅ Tarea creada: {t["title"]}')
            created += 1
        else:
            print(f'❌ Error en: {t["title"]} - {r.status_code} - {r.text}')
    
    print(f'\n✅ {created}/10 tareas creadas exitosamente')

if __name__ == "__main__":
    main()
