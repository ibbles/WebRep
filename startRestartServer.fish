#!/usr/bin/fish


while test 1 -eq 1
    echo -e "\n---- BEGIN ----"
    node ./bin/www &
    inotifywait -qe close_write **.js
    echo -e "---- END ----\n"
    for pid in (pgrep node)
        set cmdLine (strings -1 /proc/$pid/cmdline)
        if test "$cmdLine" = "node ./bin/www"
            kill -SIGKILL $pid
        end
    end
end


## Old
#
#set serverPid 0
#while test 1 -eq 1
#    echo -e "\n---- BEGIN ----"
#    if test $serverPid -ne 0
#        set serverCommandLine (strings -1 /proc/$serverPid/cmdline)
#        if test "$serverCommandLine" = "node ./bin/www"
#            echo "A server already running with pid $serverPid. Stopping it."
#            echo killing "'"(strings -1 /proc/$serverPid/cmdline)"'"
#            kill -SIGINT $serverPid
#            sleep 1
#        else
#            echo "Command line is '$serverCommandLine' for pid $serverPid does not belong to a server we started. Not stopping."
#        end
#    end
#    echo "Starting server."
#    node ./bin/www &
#    set serverPid (jobs -lp | tail -n 1)
#    echo "Server started with pid $serverPid."
#    sleep 1
#    echo "Waiting for restart signal."
#    inotifywait -qe close_write **.js
#    echo "Got restart signal."
#end
#
#echo "Infinite while-loop terminated." 
#
#