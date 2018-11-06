#!/bin/bash
# Setup a shorter prompt
# Check for a duplicate initialisation events
task=$1
if [[  -z "$PS1_BACKUP" ]]; then
    # Running for the first time.
    echo -e ""
    echo -e "(INFO): Storing current prompt configuration."
    echo -e ""
    # Backup the prompt.
    export PS1_BACKUP=$PS1;
    if [[ -z "$task" ]]; then
        PS1='[\[\e[33m\]\W::default\[\e[m\]]\n'
    else
        PS1='[\[\e[33m\]\W::$task\[\e[m\]]\n'
    fi

else
    # Next run.
    echo -e ""
    echo -e "(INFO): Reversing any prompt related changes."
    echo -e ""
    # Restore the  prompt.
    export PS1=$PS1_BACKUP
    unset PS1_BACKUP
fi
