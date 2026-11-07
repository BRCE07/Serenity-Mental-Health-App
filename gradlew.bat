@rem
@rem Copyright 2015 the original author or authors.
@rem
@rem Licensed under the Apache License, Version 2.0 (the "License");
@rem you may not use this file except in compliance with the License.
@rem You may obtain a copy of the License at
@rem
@rem      https://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing, software
@rem distributed under the License is distributed on an "AS IS" BASIS,
@rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@rem See the License for the specific language governing permissions and
@rem limitations under the License.
@rem

@if "%DEBUG%" == "" @echo off
@rem ##########################################################################
@rem
@rem  Gradle startup script for Windows
@rem
@rem ##########################################################################

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

@rem Resolve any "." in APP_HOME to its absolute path
set APP_HOME=%CD%

@rem Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if "%ERRORLEVEL%" == "0" goto init

echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe

if exist "%JAVA_EXE%" goto init

echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:init
@rem Get command-line arguments, handling Windows variants

if not "%OS%" == "Windows_NT" goto win9xME_args

:win9xME_args
@rem Turn off beeping sound
if "%SOUND_CMD%" == "" goto skipSoundBeeps
%SOUND_CMD% off

:skipSoundBeeps
@rem End of beeping sound configuration

@rem Get command-line arguments (handling Windows variants)
if "%@eval[2+2]" == "4" goto 4NT_args

:winnt_args
goto skipSfxArgs
:sfxArgs
set SFX_ARG=%~1
shift /1
goto winnt_args
:4NT_args
:get_args_path
if not exist "%APP_HOME%\gradle\wrapper\gradle-wrapper.jar" goto fail
goto end

:winnt_args
@rem Copy command-line arguments to temp file
set TMP=%TEMP%
set GRADLE_STARTUP_TMP_FILE=%TMP%\gradleStartupTmp.txt
set GRADLE_STARTUP_TMP_FILE_2=%TMP%\gradleStartupTmp2.txt

@rem Collect all arguments
echo %* > "%GRADLE_STARTUP_TMP_FILE%"

:loop
set /p LINE=
if "%LINE%"=="" goto endloop
echo %LINE% >> "%GRADLE_STARTUP_TMP_FILE_2%"
goto loop

:endloop
@rem Read arguments from temp file
for /f "delims=" %%i in ("%GRADLE_STARTUP_TMP_FILE%") do set CMD_LINE=%%i

@rem Process arguments
set CMD_LINE=%CMD_LINE:/=\%

:checkEnv
if "%CMD_LINE%"=="" goto runGradle
set CMD_LINE=%CMD_LINE:~0,1%
if "%CMD_LINE%"==" " goto checkEnv
goto runGradle

:runGradle
set ARGS=
:parseArgs
if "%CMD_LINE%"=="" goto execGradle
set /p ARG=
set ARGS=%ARGS% %ARG%
goto parseArgs

:execGradle
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% -classpath "%APP_HOME%\gradle\wrapper\gradle-wrapper.jar" -Dorg.gradle.appname=%APP_BASE_NAME% org.gradle.wrapper.GradleWrapperMain %ARGS%

:end
endlocal
goto :eof

:fail
endlocal
goto :eof

:findJavaHome
for /f "delims=" %%a in ('reg query "HKEY_LOCAL_MACHINE\SOFTWARE\JavaSoft\Java Development Kit" /v CurrentVersion 2^>nul') do set JAVA_VERSION=%%a
if not "%JAVA_VERSION%"=="" (
    for /f "delims=" %%a in ('reg query "HKEY_LOCAL_MACHINE\SOFTWARE\JavaSoft\Java Development Kit\%JAVA_VERSION%" /v JavaHome 2^>nul') do set JAVA_HOME=%%a
)
if not "%JAVA_HOME%"=="" goto init
goto fail
