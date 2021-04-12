#!/bin/bash
#Script per l'avvio del server AssettoCorsa

#tmux -S shareds new -s acserver -d 
#tmux -S shareds send-keys -t acserver 'cd /home/steam/assetto/; ./acServer' C-m
cd /assetto/
screen -d -m -S acserver ./acServer
touch /assetto/serverstarted
echo "Server started"
