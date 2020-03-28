#!/bin/bash
ssh $deploy_user@$deploy_host /home/$deploy_user/deploy.sh $1 $2
exit $?