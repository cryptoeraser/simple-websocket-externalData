#!/bin/bash
# Setup a shorter prompt
# Check for a duplicate initialisation events
if [[  -z "$PS1_BACKUP" ]]; then
    # Running for the first time.
    echo -e ""
    echo -e "(INFO): Storing current prompt configuration."
    echo -e ""
    # Backup the prompt.
    export PS1_BACKUP=$PS1;
    # export PS1="[\e[36m\W\] \[\e[33m\]\[\e[1m\]$ \[\e[0m\]"
    export PS1="[\[\e[33m\]\W\[\e[m\]]\n"
else
    # Next run.
    echo -e ""
    echo -e "(INFO): Reversing any prompt related changes."
    echo -e ""
    # Restore the  prompt.
    export PS1=$PS1_BACKUP
    unset PS1_BACKUP
fi
