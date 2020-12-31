import os
import json
path = "/disco3/SteamLibrary/steamapps/common/assettocorsa/content/cars/"
listepath = [f.path for f in os.scandir(path) if f.is_dir()]
final = []
salvataggio = open("accars.json", "w+", encoding="utf-8")
listamacchine = open("macchine.txt", "w+", encoding="utf-8")
for macchina in listepath:
    nome = macchina.replace("/disco3/SteamLibrary/steamapps/common/assettocorsa/content/cars/","")
    print(macchina)
    sub = [f.path for f in os.scandir(macchina) if f.is_dir()]
    print(sub)
    if (macchina + "/skins") in sub:
        listaskins_path = [f.path for f in os.scandir(macchina + "/skins/") if f.is_dir()]
        listaskins = [elem.replace(macchina + "/skins/","") for elem in listaskins_path]
        final[nome]=listaskins
    else:
        final[nome]=None
listamacchine.write("\n".join(["<option>" + elem.replace("/disco3/SteamLibrary/steamapps/common/assettocorsa/content/cars/","").strip("\n") + "</option>\n" for elem in listepath]))

salvataggio.write(json.dumps(final, indent=2))

