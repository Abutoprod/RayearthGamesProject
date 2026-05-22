#!/usr/bin/env sh
##
## Gradle start up script for UN*X
##

# Attempt to set APP_HOME
PRG="$0"
while [ -h "$PRG" ]; do
  ls=$(ls -ld "$PRG")
  link=$(expr "$ls" : '.*-> \(.*\)$')
  if expr "$link" : '/.*' > /dev/null; then
    PRG="$link"
  else
    PRG=$(dirname "$PRG")"/$link"
  fi
done
APP_HOME=$(dirname "$PRG")
APP_HOME=$(cd "$APP_HOME" && pwd)

CLASSPATH="$APP_HOME/gradle/wrapper/gradle-wrapper.jar"
JAVA_OPTS=""
GRADLE_OPTS="${GRADLE_OPTS:-}"

exec java $JAVA_OPTS -classpath "$CLASSPATH" org.gradle.wrapper.GradleWrapperMain "$@"
