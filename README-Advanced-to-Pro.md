# AKS HOL - Advanced to Pro

## Introduction

## Purpose

## What to Accomplish

- ### Understand K8s High Level Architecture

- ### Understand AKS High Level Architecture

  - #### AKS Baseline architecture

  - #### Ancilliary components of AKS cluster

    - Virtual Network
    - Azure Container Registry
    - Key Vault
    - Service Principal
    - Application Gateway

- ### Create AKS Cluster

  - Cluster Sizing
  - AutoScaling
  - Authentication
  - Authorization
    - Azure AD
    - RBAC

- ### Deploy Microservices

  - #### Deployment

    - Versioning
    - Node Affinity/Anti-Affnity
    - Pod Affinity/Anti-Affnity
    - Pod DIsruption Budget (*PDB*)

  - #### Service

    - External Ingress
    - Internal Ingress
    - Network Policy - *East/West Security*
    - Headeless Service

  - #### Persistent Storage

    - PeristentVolume
    - PeristentVolumeCaim
    - Persistence with Azure File
    - Persistence with Azure Disk

  - #### StatefuleSet

- ### Cluster Configuration - Post Creation

  - Multi Tenancy
  - Hardening
    - Install Nginx Ingress as *Internal LoadBalancer*
    - DNS Zone
    - Private DNS Zone
    - Deploy Application Gateway
      - SSL Offloading
      - End to End SSL
    - Lock down external access to Microservices within the Cluster 

- ### Automation

  - Pre-Config
  - Setup
  - Post-Config

- ### Further Hardening 

  - Deploy Hub-n-Spoke Network model
  - BYO DNS
  - Create Private AKS Cluster
  - Add WAF to Application Gateway - Inbound Security
  - Deploy Azure Firewall - Outbound Security
  - Private Endpoint for *Azure Container Registry*
  - Private Endpoint for *Azure KeyVault* 
  - Azure Policy

- ### Maintenance

  - Monitoring

    - Azure Monitor
    - Azure Log Analytics
    - Prometheus Integration
    - Grafana
    - Load Testing 
      - JMeter Cluster

  - Service Mesh

    - What it is?
    - Features
    - Best Options
      - Linkerd
      - Istio
    - Observability
    - Traffic Splitting
    - Fault Injection
    - Blue/Green Deployment
    - Distributed Tracing
    - Multi Cluster Connectivity
      - Extend Clustrer Capability
      - Smooth Transition between Stages - *DEV -> QA -> PROD*
      - Advanced Use cases
        - Elastic Scaling

  - Cluster Upgrades

    

## Exclusions

- Enhanced Control of K8s cluster
  - K8s REST API
  - Admission Webhook; Validation Webhook
- Integration with APIM
- Integration with DevOps
- GitOps

## References

