import requests

def fetch_data(endpoint, filter_params={}):

    if 'id' in filter_params:
        character_id = filter_params.pop('id')
        url = f'https://rickandmortyapi.com/api/{endpoint}/{character_id}'
        response = requests.get(url)
    else:
        url = f'https://rickandmortyapi.com/api/{endpoint}'
        response = requests.get(url, params=filter_params)
        
    return response.json()


rick_data = fetch_data('character', {'id': 1})


print(rick_data['name'])

rick_search_data = fetch_data('character', {'name': 'Rick Sanchez'})

controladora= 0
print(len(rick_search_data['results']))
while 'results' in rick_search_data and len(rick_search_data['results']) >= controladora+1:
    controladora+= 1
    first_rick = rick_search_data['results'][controladora - 1]
    print(first_rick['origin']['name'])

