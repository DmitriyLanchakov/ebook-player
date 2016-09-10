from django.http import HttpResponse
import datetime
import json
from api.models import Fish
from django.http import HttpResponseRedirect
import requests
from bs4 import BeautifulSoup

def json_custom_parser(obj):
    if isinstance(obj, datetime.datetime) or isinstance(obj, datetime.date):
        dot_ix = 19
        return obj.isoformat()[:dot_ix]
    else:
        raise TypeError(obj)

def get_book(request, book_id):

    book_data = requests.get('https://librivox.org/api/feed/audiobooks/?id='+str(book_id)+'&format=json').json()['books'][0]
    final = {
        "totaltime": book_data['totaltime'],
        "totaltimesecs": book_data['totaltimesecs'],
        "title": book_data['title'],
        "author": book_data['authors'][0]['first_name'] + ' ' + book_data['authors'][0]['last_name'],
        "num_sections": book_data['num_sections'],
        "url_project": book_data['url_project'],
        "id": book_data['id']
    }

    if 'url_librivox' in book_data:
        resp = requests.get(book_data['url_librivox'])
        soup = BeautifulSoup(resp.text)
        all_links = []
        for link in soup.findAll("a", { "class" : "play-btn" }):
            if link.has_attr('href'):
                all_links.append(link['href'])
                print link['href']
        final['sections'] = all_links
        
    elif 'url_iarchive' in book_data:
        resp = requests.get('https://archive.org/embed/uncle_toms_cabin_librivox&playlist=1')
        #resp = requests.get(book_data['url_librivox'])
        all_links = []
        for track in json.loads(resp.text.split('play_setup')[1].split("Play('jw6',")[1].split('{"start')[0].strip()[:-1]):
            for source in track['sources']:
                if source['type'] == "mp3":
                    all_links.append("https://archive.org/" + source['file'])
                    break
        final['sections'] = all_links

    return HttpResponse(json.dumps(final, default=json_custom_parser), content_type='application/json', status=200)


def load_frontend(request):
    return HttpResponseRedirect("/static/index.html")
