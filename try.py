# import urllib.request
# import sys
# import urllib.parse
# import urllib.request

# url = sys.argv[1]    
# # url = ["https://petconnect.sgp1.digitaloceanspaces.com/development/advt_images/92e8520f-1b68-4261-8023-8a9c5a3b9f91-CompressJPEG.online_512x512_image.jpeg"]
# url_str = "".join(url)
# encoded_url = urllib.parse.quote(url_str, safe=':/')
# # encoded_urls = list(map(lambda u: urllib.parse.quote(u, safe=':/'), url_str))

# try:
#     with urllib.request.urlopen(encoded_url) as url_response:
#         # process the response
#         print(encoded_url)
#         print("Pass!")
#         pass
# except Exception as e:
#     print(url)
#     print(url_str)
#     print(encoded_url)
#     print(f"Error fetching URL: {e}")
#     sys.exit(1)


import sys
import json
import urllib.parse
import urllib.request

url_str = sys.argv[1]
url_list = json.loads(url_str)
encoded_urls = list(map(lambda u: urllib.parse.quote(u, safe=':/'), url_list))

for encoded_url in encoded_urls:
    try:
        with urllib.request.urlopen(encoded_url) as url_response:
            # process the response
            print(encoded_url)
            print("Pass!")
    except Exception as e:
        print(encoded_url)
        print(f"Error fetching URL: {e}")
        sys.exit(1)
