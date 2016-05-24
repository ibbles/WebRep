#!/usr/bin/fish

set serverPid 0
while test 1 -eq 1
    echo -e "\n---- BEGIN ----"
    if test $serverPid -ne 0
        set serverCommandLine (strings -1 /proc/$serverPid/cmdline)
        if test "$serverCommandLine" = "node ./bin/www"
            echo "A server already running. Stopping it."
            kill -SIGINT $serverPid
        else
            echo "Command line is '$serverCommandLine' does not belong to a server we started. Not stopping."
        end
    end
    echo "Starting server."
    node ./bin/www &
    set serverPid (jobs -lp)
    echo "Server started with pid $serverPid."
    sleep 1
    echo "Waiting for restart signal."
    inotifywait -qe close_write **.js
    echo "Got restart signal."
end
