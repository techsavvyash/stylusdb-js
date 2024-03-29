/**
 * @description {
 * This file implements the orchestrator. Orchestrator has the following features for now:
 *  1. Telling the proxy/load balancer about who the leader of the raft cluster is so that we know what needs to be done there
 *  2. Helping the proxy/load balancer to side load the traffic to correct nodes
 * }
 */

// open a TCP Socket to listen to connections
