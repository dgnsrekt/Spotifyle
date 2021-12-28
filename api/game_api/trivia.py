import requests
import string
from .stop_words import STOP_WORDS
from collections import Counter
from django.conf import settings
import random

TOKEN = settings.GENIUS_CLIENT_TOKEN

HEADERS = {"Authorization": f"Bearer {TOKEN}"}


def remove_punctuation(dirty_string):
    return dirty_string.translate(str.maketrans("", "", string.punctuation))


def most_frequent(collection):
    counter = Counter(collection)
    item, count = counter.most_common(1).pop()
    if not count:
        return None, None
    return item


def filter_stop_words(artist_name):
    artist_name = remove_punctuation(artist_name)
    # print("stop", artist_name.lower())
    return filter(lambda word: word.lower() not in STOP_WORDS, artist_name.split())


def parse_artist_id(hits, artist_name):
    compare_artist_responses = []
    artist_id = None

    for song in hits:
        result = song.get("result")
        if not result:
            continue

        primary_artist = result.get("primary_artist")
        name = primary_artist.get("name").lower()
        artist_id = primary_artist.get("id")
        compare_artist_responses.append((name, artist_id))

        if artist_name.lower() == name.lower():
            return artist_id

    if len(set(compare_artist_responses)) == 1:
        return artist_id

    most_freq_name, artist_id = most_frequent(compare_artist_responses)

    most_freq_name_set = set(filter_stop_words(most_freq_name.replace(" ", "").lower()))
    artist_name_set = set(filter_stop_words(artist_name.replace(" ", "").lower()))

    similarity_found = artist_name_set.intersection(most_freq_name_set)

    if similarity_found:
        return artist_id

    return None


def fetch_artist_id(*, artist_name):
    response = requests.get(f"https://api.genius.com/search?q={artist_name}", headers=HEADERS)

    response = response.json().get("response")
    if not response:
        return None

    hits = response.get("hits")
    if not hits:
        return None

    return parse_artist_id(hits, artist_name)


def get_artist_description(*, artist_id):
    response = requests.get(
        f"https://api.genius.com/artists/{artist_id}?text_format=plain", headers=HEADERS
    )
    if response.ok:
        artist = response.json().get("response").get("artist")
        name = artist.get("name")
        description = artist.get("description").get("plain")
        return name, description
    return None, None


def create_question(*, answer):
    artist_id = fetch_artist_id(artist_name=answer)

    if not artist_id:
        return None, None

    artist_name, description = get_artist_description(artist_id=artist_id)

    if not all([artist_name, description]):
        return None, None

    split_description = description.split("\n\n")
    split_description = map(lambda text: text.replace("\n", ""), split_description)
    split_description = filter(lambda text: " " in text, split_description)
    split_description = filter(lambda text: "." in text, split_description)
    sentences = list(filter(lambda text: len(text) > 0, split_description))

    artist_name = artist_name.replace("\u200b", "").replace("\n", "")
    # print(artist_name)

    SEARCH_NAME = list(
        filter(lambda word: word.lower() not in STOP_WORDS, remove_punctuation(artist_name).split())
    )

    output = []
    for sentence in sentences:  # limit sentence to 10 or 20
        question = []
        for phrase in sentence.split():  # filter sentences with words over n amount.
            for name in SEARCH_NAME:
                if name.lower() in phrase.lower():
                    spaces = "_" * len(name)
                    clean = phrase.lower().replace(name.lower(), spaces)
                    question.append(clean)
                    break
            else:
                question.append(phrase)
        text_question = " ".join(question)

        if artist_name in text_question:
            continue
        output.append(text_question)

    if not output:
        return None, None

    final = random.choice(output)

    return final, artist_name
