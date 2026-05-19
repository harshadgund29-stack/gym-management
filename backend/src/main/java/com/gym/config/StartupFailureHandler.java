package com.gym.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.diagnostics.AbstractFailureAnalyzer;
import org.springframework.boot.diagnostics.FailureAnalysis;
import org.springframework.boot.web.server.PortInUseException;

import java.net.ConnectException;

/**
 * StartupFailureHandler — provides clear, actionable error messages
 * when the app cannot start due to port conflicts or DB connection failures.
 */
public class StartupFailureHandler extends AbstractFailureAnalyzer<PortInUseException> {

    private static final Logger log = LoggerFactory.getLogger(StartupFailureHandler.class);

    @Override
    protected FailureAnalysis analyze(Throwable rootFailure, PortInUseException cause) {
        int port = cause.getPort();
        log.error("[STARTUP] Port {} is already in use. Free it with:", port);
        log.error("[STARTUP]   Windows: netstat -ano | findstr :{}", port);
        log.error("[STARTUP]            taskkill /PID <PID> /F");
        log.error("[STARTUP]   Linux:   lsof -ti:{} | xargs kill -9", port);

        return new FailureAnalysis(
            "Port " + port + " is already in use.",
            "Free port " + port + " before starting the application:\n" +
            "  Windows: netstat -ano | findstr :" + port + "\n" +
            "           taskkill /PID <PID> /F\n" +
            "  Linux:   lsof -ti:" + port + " | xargs kill -9",
            cause
        );
    }
}
