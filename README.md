# AKS HOL - Basic to Advanced

## Table of Contents

- **[K8s High Level Architecture](#K8s-High-Level-Architecture)**
- **[AKS High Level Architecture](#AKS-High-Level-Architecture)**
- **[AKS Baseline Architecture](#AKS-Baseline-Architecture)**
- **[Target Reference Architecture](#Target-Reference-Architecture)**
- **[What to Accomplish](#What-to-Accomplish)**
- **[HOL](#HOL)**
  - **[Local Variables](#Local-Variables)**
  - **[Login to Azure](#Login-to-Azure)**
  - **[Pre Config](#Pre-Config)**
    - **[Service Principal](#Service-Principal)**
    - **[Resource Group](#Resource-Group)**
    - **[Virtual Network](#Virtual-Network)**
    - **[Azure Container Registry](#Azure-Container-Registry)**
    - **[KeyVault](#KeyVault)**
    - **[Log Analytics Workspace](#Log-Analytics-Workspace)**
    - **[Network Peering](#Network-Peering)**
  - **[Setup](#Setup)**
    - **[Create AKS Cluster](#Create-AKS-Cluster)**
      - **[Isolation](#Isolation)**
      - **[Cluster Creation](#Cluster-Creation)**
      - **[Authentication](#Authentication)**
      - **[Nodepool Creation](#Nodepool-Creation)**
      - **[AutoScaling](#AutoScaling)**
        - **[Update System Nodepool](#Update-System-Nodepool)**
        - **[Update API Nodepool](#Update-API-Nodepool)**
  - **[Post Config](#Post-Config)**
    - **[Secure AKS Cluster](#Secure-AKS-Cluster)**
    - **[Create Namespaces](#Create-Namespaces)**
    - **[Deploy Application Gateway](#Deploy-Application-Gateway)**
    - **[RBAC](#RBAC)**
    - **[Ingress Smoke](#Ingress-Smoke)**
    - **[TEST Smoke](#TEST-Smoke)**
    - **[SSL Options](#SSL-Options)**
  - **[Resources Sizing for Containers](#Resources-Sizing)**
  - **[Readiness/Liveness for Containers](#Readiness/Liveness)**
  - **[Network Policies](#Network-Policies)**
  - **[Monitoring and Logging](#Monitoring-and-Logging)**
  - **[Cluster Health](#Cluster-Health)**
  - **[Enable Prometheus for AKS](#Enable-Prometheus-for-AKS)**
  - **[Monitoring with Grafana](#Monitoring-with-Grafana)**
  - **[Load Testing](#Load-Testing)**
  - **[Cluster Upgrade](#Cluster-Upgrade)**
  - **[Cleanup Resources](#Cleanup-Resources)**
- **[References](#References)**



## K8s High Level Architecture

## ![K8s-HLD](./Assets/K8s-HLD.png)



## AKS High Level Architecture

## ![AKS-HLD](./Assets/AKS-HLD.png)



## AKS Baseline Architecture

![secure-baseline-architecture](./Assets/secure-baseline-architecture.svg)



## Target Reference Architecture

![AKS-Ref-Achitecture-v2.2](./Assets/AKS-Ref-Achitecture-v2.2.png)



## What to Accomplish

- Create Infrastructure for the AKS cluster
  - Service Principal
  - Hub Virtual network
  - Spoke Virtual Network
  - Azure Container Registry
  - KeyVault
  - Role Assignments
- Create AKS Cluster
- Cluster Configuration - Post Creation
  - Secure Inbound Access
  - Deploy Internal Load Balancer
  - Deploy External Load Balancer
  - Create Namespces for various Environments - DEV, QA, Smoke
- Deploy Microservices for each environment
- Check end to end Connectivity
-  Network Policies - Add *Easst-West* traffic Security
- Monitoring, Logs
  - Cluster Health
  - Node and Pod Health
  - Observe and Analyze Workload Deployments
    - View Metrics from Azure Portal
    - View Insights from Azure Portal
    - Create a Dashboard in Azure Portal
    - Log Analytics with Container Insights
    - Select Pre-defined Queries and Check Results
    - Create Azure Monitor Workbook and View Results
- Cluster Maintenance
  - Cluster Upgrades
  - Node Image Upgrades
  - Connectivity with Control Plane


## Exclusions

- Enhanced Control of K8s cluster
  - K8s REST API
  - Admission Webhook; Validation Webhook
  
- Integration with APIM

- Integration with DevOps

- GitOps

  

## HOL

- ### Local Variables

  ```bash
  baseFolderPath=""
  setupFolderPath="$baseFolderPath/Setup"
  microservicesFolderPath="$baseFolderPath/Microservices"
  tenantId=""
  subscriptionId=""
  aksResourceGroup="aks-train-rg"
  masterResourceGroup="master-workshop-rg"
  location="eastus"
  clusterName="aks-train-cluster"
  version="1.20.9"
  acrName="akstrnacr"
  acrId=
  keyVaultName="aks-train-kv"
  keyvaultId=
  masterVnetName="master-workshop-vnet"
  masterVnetPrefix="11.0.0.0/16"
  masterVnetId=
  masterSubnetName="master-js-ubuntuvm-subnet"
  masterSubnetPrefix="11.0.1.32/27"
  masterSubnetId=
  aksVnetName="aks-train-vnet"
  aksVnetPrefix="18.0.0.0/21"
  aksVnetId=
  aksSubnetName="aks-train-subnet"
  aksSubnetPrefix="18.0.0.0/24"
  aksSubnetId=
  aksIngressSubnetName="aks-train-ingress-subnet"
  aksIngressSubnetPrefix="18.0.1.0/24"
  aksIngressSubnetId=
  aksServicePrefix="18.0.2.0/24"
  dnsServiceIP="18.0.2.10"
  appgwName="aks-train-appgw"
  appgwSubnetName="aks-train-appgw-subnet"
  appgwSubnetPrefix="18.0.3.0/27"
  appgwSubnetId=
  apimName="aks-train-apim"
  apimSubnetName="aks-train-apim-subnet"
  apimSubnetPrefix="18.0.4.0/27"
  apimSubnetId=
  sysPoolName=akssyspool
  sysPoolNodeSize="Standard_DS2_v2"
  sysPoolNodeCount=3
  sysPoolMaxPods=30
  sysPoolMaxNodeCount=5
  apiPoolName=aksapipool
  apiPoolNodeSize="Standard_DS2_v2"
  apiPoolNodeCount=3
  apiPoolMaxPods=30
  apiPoolMaxNodeCount=5
  networkPlugin=azure
  networkPolicy=azure
  vmSetType=VirtualMachineScaleSets
  osType=Linux
  addons=monitoring
  masterAKSPeering="$masterVnetName-$aksVnetName-peering"
  aksMasterPeering="$aksVnetName-$masterVnetName-peering"
  masterPrivateDNSLink="$masterVnetName-dns-plink"
  aksPrivateDNSLink="$aksVnetName-dns-plink"
  aksIngControllerName="aks-train-ing"
  aksIngControllerNSName="$aksIngControllerName-ns"
  aksIngControllerFileName="internal-ingress"
  aksIngControllerFilePath="$baseFolderPath/Setup/Common/internal-ingress.yaml"
  privateDNSZoneName=""
  privateDNSZoneId=
  backendIpAddress=
  aadAdminGroupIDs=""
  aadTenantID=""
  objectId=""
  spAppId=""
  spPassword=""
  logWorkspaceName="aks-train-lw"
  lwResourceGroup="monitoring-workshop-rg"
  ```

- ### Login to Azure

  ```bash
  #Login to Azure
  az login --tenant $tenantId
  
  #Check Selected Subscription
  az account show
  
  #Set appropriate Subscription, if needed
  #az account set -s $subscriptionId
  ```

- ### Pre Config

  - #### Service Principal

    ```bash
    #Create Service Principal
    az ad sp create-for-rbac --skip-assignment -n https://aks-train-sp
    {
      "appId": "",
      "displayName": "https://arc-aks-sp",
      "name": "",
      "password": "",
      "tenant": ""
    }
    
    #Create Service Principal
    az ad sp create-for-rbac --skip-assignment -n https://aks-train-sp
    {
      "appId": "",
      "displayName": "https://arc-aks-sp",
      "name": "",
      "password": "",
      "tenant": ""
    }
    
    #Set Service Principal variables
    spAppId=""
    spPassword=""
    ```

  - #### Resource Group

    ```bash
    #Create Resource Group for AKS workloads
    az group create -n $aksResourceGroup -l $location
    ```

  - #### Virtual Network

    - ##### Azure CNI

      ![physical-isolation](./Assets/azure-cni.png)

    - ##### Hub

      ```bash
      #Deploy Hub Virtual Network
      az network vnet create -n $masterVnetName -g $masterResourceGroup --address-prefixes $masterVnetPrefix
      masterVnetId=$(az network vnet show -n $masterVnetName -g $masterResourceGroup --query="id" -o tsv)
      echo $masterVnetId
      
      #Deploy Jump Server Subnet inside Hub Virtual Network
      az network vnet subnet create -n $masterSubnetName --vnet-name $masterVnetName -g $masterResourceGroup --address-prefixes $masterSubnetPrefix
      masterSubnetId=$(az network vnet subnet show -n $masterSubnetName --vnet-name $masterVnetName -g $masterResourceGroup --query="id" -o tsv)
      echo $masterSubnetId
      ```

    - ##### Spoke

      ```bash
      #Deploy Spoke Virtual Network
      az network vnet create -n $aksVnetName -g $aksResourceGroup --address-prefixes $aksVnetPrefix
      aksVnetId=$(az network vnet show -n $aksVnetName -g $aksResourceGroup --query="id" -o tsv)
      echo $aksVnetId
      
      #Deploy AKS Subnet inside Spoke Virtual Network
      az network vnet subnet create -n $aksSubnetName --vnet-name $aksVnetName -g $aksResourceGroup --address-prefixes $aksSubnetPrefix
      aksSubnetId=$(az network vnet subnet show -n $aksSubnetName --vnet-name $aksVnetName -g $aksResourceGroup --query="id" -o tsv)
      echo $aksSubnetId
      
      #Deploy Ingress Subnet inside Spoke Virtual Network
      az network vnet subnet create -n $aksIngressSubnetName --vnet-name $aksVnetName -g $aksResourceGroup --address-prefixes $aksIngressSubnetPrefix
      aksIngressSubnetId=$(az network vnet subnet show -n $aksIngressSubnetName --vnet-name $aksVnetName -g $aksResourceGroup --query="id" -o tsv)
      echo $aksIngressSubnetId
      
      #Deploy Application Gateway Subnet inside Spoke Virtual Network
      az network vnet subnet create -n $appgwSubnetName --vnet-name $aksVnetName -g $aksResourceGroup --address-prefixes $appgwSubnetPrefix
      appgwSubnetId=$(az network vnet subnet show -n $appgwSubnetName --vnet-name $aksVnetName -g $aksResourceGroup --query="id" -o tsv)
      echo $appgwSubnetId
      
      #Deploy API Management Subnet inside Spoke Virtual Network
      az network vnet subnet create -n $apimSubnetName --vnet-name $aksVnetName -g $aksResourceGroup --address-prefixes $apimSubnetPrefix
      apimSubnetId=$(az network vnet subnet show -n $apimSubnetName --vnet-name $aksVnetName -g $aksResourceGroup --query="id" -o tsv)
      echo $apimSubnetId
      
      #Assign Role to Spoke Virtual Network
      az role assignment create --assignee $spAppId --role "Network Contributor" --scope $aksVnetId
      ```

  - #### Azure Container Registry

    ```bash
    #Deploy ACR
    az acr create -n $acrName -g $aksResourceGroup --sku STANDARD --admin-enabled false
    acrId=$(az acr show -n $acrName -g $aksResourceGroup --query="id" -o tsv)
    echo $acrId
    
    #Assign Role to Service Principal for the ACR
    az role assignment create --assignee $spAppId --role "AcrPull" --scope $acrId
    ```

  - #### KeyVault

    ```bash
    #Deploy KeyVault
    az keyvault create -n $keyVaultName -g $aksResourceGroup --sku Standard
    objectId=$(az ad user show --id modatta@microsoft.com --query="objectId" -o tsv)
    
    #Set Access Policy to KeyVault for the loged in User 
    az keyvault set-policy -n $keyVaultName -g $aksResourceGroup --key-permissions get list update create delete \
    --secret-permissions get list set delete --certificate-permissions get list update create delete \
    --object-id $objectId
    keyvaultId=$(az keyvault show -n $keyVaultName -g $aksResourceGroup --query="id" -o tsv)
    ```

  - #### Log Analytics Workspace

    ```bash
    #Deploy LogAnalytics Workspace
    az monitor log-analytics workspace create -n $logWorkspaceName -g $lwResourceGroup
    logWorkspaceId=$(az monitor log-analytics workspace show -n $logWorkspaceName -g $lwResourceGroup --query="id" -o tsv)
    echo $logWorkspaceId
    
    #Assign Role to Service Principal for the LogAnalytics Workspace
    az role assignment create --assignee $spAppId --role "Contributor" --scope $logWorkspaceId
    ```
    
  - ##### Network Peering

    ```bash
    #Master Vnet to AKS Peering
    az network vnet peering create -n $masterAKSPeering --remote-vnet $aksVnetName \
    -g $masterResourceGroup --vnet-name $masterVnetName
    
    #AKS Vnet to Master Peering
    az network vnet peering create -n $aksMasterPeering --remote-vnet $masterVnetName \
    -g $masterResourceGroup --vnet-name $aksVnetName
    ```
    
    

- ### Setup
  
  - #### Create AKS Cluster
  
    - ##### Isolation
  
      - ###### Physical
  
      ​	![physical-isolation](./Assets/physical-isolation.png)
  
      
  
      - ###### Logical
  
      ​	![logical-isolation](./Assets/logical-isolation.png)
  
    
  
    - ##### Cluster Creation
  
      ```bash
      #Create Public AKS cluster
      az aks create --name $clusterName \
      --resource-group $aksResourceGroup \
      --kubernetes-version $version --location $location \
      --vnet-subnet-id "$aksSubnetId" --enable-addons $addons \
      --service-cidr $aksServicePrefix --dns-service-ip $dnsServiceIP \
      --node-vm-size $sysPoolNodeSize \
      --node-count $sysPoolNodeCount --max-pods $sysPoolMaxPods \
      --service-principal $spAppId \
      --client-secret $spPassword \
      --network-plugin $networkPlugin --network-policy $networkPolicy \
      --nodepool-name $sysPoolName --vm-set-type $vmSetType \
      --generate-ssh-keys \
      --enable-aad \
      --aad-admin-group-object-ids $aadAdminGroupIDs \
      --aad-tenant-id $aadTenantID \
      --attach-acr $acrName --workspace-resource-id $logWorkspaceId
      ```
  
    - ##### Authentication
  
      ```bash
      #Connect to AKS cluster and check status
      az aks get-credentials -g $aksResourceGroup --name $clusterName --admin --overwrite
      kubectl get ns
      
      #Connect to AKS cluster as Admin
      az aks get-credentials -g $resourceGroup -n $clusterName --admin
      ```
  
    - ##### Nodepool Creation
  
      ```bash
      #Create Additional Nodepool - API Nodepool
      az aks nodepool add --cluster-name $clusterName --resource-group $aksResourceGroup \
      --name $apiPoolName --kubernetes-version $version --max-pods $apiPoolMaxPods \
      --node-count $apiPoolNodeCount --node-vm-size $apiPoolNodeSize --os-type $osType \
      --mode User
      ```
  
    - ##### AutoScaling
  
      ![AKS-Components-AutoScaling](./Assets/AKS-Components-AutoScaling.png)
  
      
  
      - ###### Update System Nodepool
  
        ```bash
        az aks nodepool update --cluster-name $clusterName --resource-group $aksResourceGroup \
        --enable-cluster-autoscaler --min-count $sysPoolNodeCount --max-count $sysPoolMaxNodeCount \
        --name $sysPoolName
        ```
  
      - ###### Update API Nodepool
  
        ```bash
        az aks nodepool update --cluster-name $clusterName --resource-group $aksResourceGroup \
        --enable-cluster-autoscaler --min-count $apiPoolNodeCount --max-count $apiPoolMaxNodeCount \
        --name $apiPoolName
        ```
  
- #### Post-Config

  ![appgw-overview](./Assets/appgw-overview.png)

  

  ![aks-short-view](./Assets/aks-short-view.png)

  - ##### Secure AKS cluster

    ```bash
    #A Private DNS Zone is needed to resolve all Private IP addresses
    #Prepare Azure Private DNS Zone
    
    #Create Azure Private DNS Zone
    az network private-dns zone create -n $privateDNSZoneName -g $masterResourceGroup
    privateDNSZoneId=$(az network private-dns zone show -g $masterResourceGroup -n $privateDNSZoneName --query="id" -o tsv)
    echo $privateDNSZoneId
    
    #Add RecordSet for dev
    az network private-dns record-set a create -n aks-train-dev -g $masterResourceGroup --zone-name $privateDNSZoneName
    az network private-dns record-set a add-record -a $backendIpAddress -n aks-train-dev -g $masterResourceGroup -z $privateDNSZoneName
    
    #Add RecordSet for qa
    az network private-dns record-set a create -n aks-train-qa -g $masterResourceGroup --zone-name $privateDNSZoneName
    az network private-dns record-set a add-record -a $backendIpAddress -n aks-train-qa -g $masterResourceGroup -z $privateDNSZoneName
    
    #Add RecordSet for smoke
    az network private-dns record-set a create -n aks-train-smoke -g $masterResourceGroup --zone-name $privateDNSZoneName
    az network private-dns record-set a add-record -a $backendIpAddress -n aks-train-smoke -g $masterResourceGroup -z $privateDNSZoneName
    
    #Link master Virtual Network to Private DNS Zone
    az network private-dns link vnet create -g $masterResourceGroup -n $masterPrivateDNSLink -z $privateDNSZoneName -v $masterVnetId -e false
    az network private-dns link vnet show -g $masterResourceGroup -n $masterPrivateDNSLink -z $privateDNSZoneName
    
    #Link AKS Virtual Network to Private DNS Zone
    az network private-dns link vnet create -g $masterResourceGroup -n $aksPrivateDNSLink -z $privateDNSZoneName -v $aksVnetId -e false
    az network private-dns link vnet show -g $masterResourceGroup -n $aksPrivateDNSLink -z $privateDNSZoneName
    
    #Create Ingress Namespace
    kubectl create namespace $aksIngControllerNSName
    #kubectl label namespace $aksIngControllerNSName name=$aksIngControllerNSName
    
    #Install nginx as ILB using Helm
    helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
    helm repo update
    
    #Install Ingress controller
    helm install $aksIngControllerName ingress-nginx/ingress-nginx --namespace $aksIngControllerNSName \
    
    #Specify configuration values for Ingress controller 
    -f $ingControllerFilePath \
    
    #Ensures Private IP for Nginx Ingress Controller
    --set controller.service.loadBalancerIP=$backendIpAddress \
    
    #Ensures that the Nginx Ingress Controller is deployed only on System pool (Good practice)
    --set controller.nodeSelector.agentpool=$sysPoolName \
    --set controller.defaultBackend.nodeSelector.agentpool=$sysPoolName \
    
    #Specify the Subnet from Ingress controller should pick IP addresses (Good practice)
    --set controller.service.annotations.'service\.beta\.kubernetes\.io/azure-load-balancer-internal-subnet'=$aksIngressSubnetName
    
    helm install $aksIngControllerName ingress-nginx/ingress-nginx --namespace $aksIngControllerNSName \
    -f $aksIngControllerFilePath \
    --set controller.service.loadBalancerIP=$backendIpAddress \
    --set controller.nodeSelector.agentpool=$sysPoolName \
    --set controller.defaultBackend.nodeSelector.agentpool=$sysPoolName \
    --set controller.service.annotations.'service\.beta\.kubernetes\.io/azure-load-balancer-internal-subnet'=$aksIngressSubnetName
    
    #helm uninstall $aksIngControllerName --namespace $aksIngControllerNSName
    
    #Check Ingress Controller IP
    kubectl get svc -A
    ```

  - ##### Create Namespaces

    ```bash
    #Create Namespaces
    #DEV workloads
    kubectl create ns aks-train-dev
    
    #QA workloads
    kubectl create ns aks-train-qa
    
    #Smoke Test
    kubectl create ns aks-train-smoke
    ```

  - ##### Deploy **Application Gateway**

    ![appgw-overview](./Assets/appgw-internals.png)

    

    ```bash
    #Deploy Application Gateway
    Portal - https://docs.microsoft.com/en-us/azure/application-gateway/quick-create-portal
    CLI - https://docs.microsoft.com/en-us/azure/application-gateway/quick-create-cli
    ```

    - ###### Create **Application Gateway**

      - Ideally this should be done through ARM template; for this exercise, assume that the resource would be created using Azure Portal

      - Components created along with *Application Gateway*

        - **Backend Pool**

          - *IP Addresses/FQDNs* of the AKS Cluster
          - Requests would be forwarded to this cluster

        - **Http/s Listeners**

          - Listens for all incoming traffics
          - Supports both Http and Https clients
          - Clients that want to connect over Https, should upload the PFX Certificate (*containing the Private Key*) of their DNS server; during the Creation or Initial Configuration of *Application Gateway*
          - Application Gateway acts as a server for the Client that wants to connect. For Https, it uses the Private Key of PFX certificate to Decrypt message from Clients
          - **Basic**
            - *Single Tenant*
            - Client wants to connect to only single Backend Pool
          - **Multi-Site**
            - *Multi Tenant*
            - Same Client wants to connect to multiple backends based on **host-header** or *host-name*

        - **Http Rules**

          - **Basic**

            - *Single* backend host for the *Associated Listener*
            - *Routing* is handled the backend only (i.e. *in this case inside AKS cluster*); nothing to be decided at the Application Gateway level
          - **Path-Based**

            - *Route* to appropriate backend based on *Path* parameters
            - Same backend host but different internal paths - */backend/path1, /backend/path2* etc.

        - **Http Settings**

          - Defines Backend Http/S settings

          - **Http**

            - Client does not want SSL to flow through then it is offloaded at Application Gateway and subsequent communication is *Http*

          - **Https**

            - SSL to continue till *Backend host*
            - Need to upload **Trusted Toot Certificate** of the *Backend Server*
            - Here Application Gateway acts as the Client and *backend host* acts as the Server

          - **Health Probe**

            - *Monitors* the health pdf Backend Pool

            - Removes *Unhealthy* resources from Pool automatically and Puts them back when they are *healthy*

            - Consults with *Http Settings* and based on the configuration calls defined health probe route periodically

            - For backend systems like *AKS* or *APIM*, this is imperative that a custom health probe is specified while creating or configuring the Application Gateway

              

    - ###### Configure **Backend Pool**

      ![appgw-bkpool](./Assets/appgw-bkpool.png)

      

      ![appgw-bkpool](./Assets/appgw-bkpool-aks.png)

      

      - Target IP address is the Private IP of the Nginx Ingress Controller of AKS cluster

      - All requests are finally routed to this IP

      - This IP address is resolved through Azure Private DNS (*Ref: [Secure AKS cluster](#Secure-AKS-cluster)* )

        

    - ###### Configure **Multi-site Listener**

      - Users can reach to *Application Gateway* and ultimately to the AKS cluster in different ways
        - **dev** - for connecting to the *DEV* environment of the AKS cluster
        - **qa** - for connecting to the *QA* environment of the AKS cluster

      

      ![appgw-listeners](./Assets/appgw-listeners.png)

      

      ![appgw-listeners](./Assets/appgw-listeners-dev.png)

      

      ![appgw-listeners](./Assets/appgw-listeners-qa.png)

      

    - ###### Configure **Http Settings**

      - Decides how *Application Gateway* connects to the AKS cluster
      - Which *environment* in backend to connect to
        - **dev** - connects to aks-train-dev.internal.<dns-name>.com over **HTTP (80)**
        - **qa** - connects to aks-train-dev.internal.<dns-name>.com ocer **HTTPS (443)**

      ![appgw-http-settings](./Assets/appgw-http-settings.png)

      

      ![appgw-http-settings](./Assets/appgw-http-settings-dev.png)

      

      ![appgw-http-settings](./Assets/appgw-http-settings-dev-2.png)

      

      ![appgw-http-settings](./Assets/appgw-http-settings-qa.png)

      

      ![appgw-http-settings](./Assets/appgw-http-settings-qa-2.png)

    ​	

    - ###### Configure **Rules**

      - **Rules** connects **Listeners**, **Backend Pools** and **Http Settings**

      ![appgw-rules](./Assets/appgw-rules.png)

      

      ![appgw-rules](./Assets/appgw-rules-dev.png)

      

      ![appgw-rules](./Assets/appgw-rules-dev-2.png)

      

      ![appgw-rules](./Assets/appgw-rules-qa.png)

      

      ![appgw-rules](./Assets/appgw-rules-qa-2.png)

    

  - ##### SSL Options

    - ###### SSL Offloading at *Application Gateway*

      ![ssl-offload](./Assets/ssl-offload.png)

      

      ```bash
      #SSL Offloading at Application Gateway
      #Current implementation DEV is already setup for this
      
      #PFX Certtificate is uploaded at Application Gateway for the Listener - aks-train-appgw-dev-listener
      #Http Settings for aks-train-appgw-dev-http-settings - is setup over Http (80)
      #Traffic from Application Gateway to Nginx Ingress Controller of AKS cluster is over Http (80)
      ```

      [ingress-chart/values-dev.yaml](./Deployments/Setup/Helms/ingress-chart/values-dev.yaml)

      ```yaml
      ingress:
        name: aks-workshop-ingress
        namespace: aks-train-dev
        annotations:
          ingressClass: nginx
          proxyBodySize: "10m"
          enableCors: "true"
          rewriteTarget: /$1    
        hosts:
        #NO TLS is enabled; hence traffic reaches Ingress over Http (80)
        #Private DNS Zone name
        - name: aks-train-dev.<dns-name>
          paths:    
          - path: /?(.*)
            pathType: Prefix
            service: ratingsweb-service
            port: 80
      ```

      

    - ###### SSL Offloading at *Nginx Ingress Controller*

      ![ssl-offload](./Assets/backend-protocol-https.png)

      
      
      [ingress-chart/values-qa-tls.yaml](./Deployments/Setup/Helms/ingress-chart/values-qa-tls.yaml)

      ```yaml
      ingress:
        name: aks-workshop-ingress
        namespace: aks-train-qa
        annotations:
          ingressClass: nginx
          proxyBodySize: "10m"
          enableCors: "true"
          rewriteTarget: /$1
        tls:
        #TLS is enabled; hence traffic reaches Ingress over Https (443)
        #TLS is offloaded at Ingress
        - hosts:
          #K8s secret for holding the TLS Certificate
          - "*.<dns-name>"
          secretName: aks-workshop-tls-secret
        hosts:
        #Private DNS Zone name
        - name: aks-train-qa.<dns-name>
          paths:
          - path: /?(.*)
            pathType: Prefix
            service: ratingsweb-service
            port: 80
      ```
      
      

  - ##### RBAC

    ```bash
    #Deploy RBAC for the AKS cluster
    helm create rbac-chart
    
    helm install rbac-chart -n aks-train-dev $setupFolderPath/Helms/rbac-chart/ -f $setupFolderPath/Helms/rbac-chart/values-dev.yaml
    #helm upgrade rbac-chart -n aks-train-dev $setupFolderPath/Helms/rbac-chart/ -f $setupFolderPath/Helms/rbac-chart/values-dev.yaml
    
    helm install rbac-chart -n aks-train-qa $setupFolderPath/Helms/rbac-chart/ -f $setupFolderPath/Helms/rbac-chart/values-qa.yaml
    #helm upgrade rbac-chart -n aks-train-qa $setupFolderPath/Helms/rbac-chart/ -f $setupFolderPath/Helms/rbac-chart/values-qa.yaml
    
    #helm uninstall rbac-chart
    
    #Check access by multiple login ids
    az aks get-credentials -g $aksResourceGroup --name $clusterName
    kubectl get no
    kubectl get ns
    ```

  - ##### Ingress Smoke

    ```bash
    #Deploy Ingress Rule object for Smoke namespace
    helm create ingress-chart
    
    helm install ingress-chart -n aks-train-smoke $setupFolderPath/Helms/ingress-chart/ -f $setupFolderPath/Helms/ingress-chart/values-smoke.yaml
    
    #helm upgrade  ingress-chart -n aks-train-smoke $setupFolderPath/Helms/ingress-chart/ -f $setupFolderPath/Helms/ingress-chart/values-smoke.yaml
    #helm uninstall ingress-chart -n aks-train-smoke
    ```

  - ##### TEST Smoke

    ```bash
    #Test Cluster Health and end-to-end connectivity
    #Deploy Nginx app in Smoke Namespace
    
    az acr import -n $acrName --source docker.io/library/nginx:alpine -t nginx:alpine
    
    helm create smoke-tests-chart
    
    helm install smoke-tests-chart -n aks-train-smoke $setupFolderPath/Helms/smoke-tests-chart/ -f $setupFolderPath/Helms/smoke-tests-chart/values-smoke.yaml
    
    #helm upgrade smoke-tests-chart -n aks-train-smoke $setupFolderPath/Helms/smoke-tests-chart/ -f $setupFolderPath/Helms/smoke-tests-chart/values-smoke.yaml
    #helm uninstall smoke-tests-chart -n aks-train-smoke
    
    #Call Nginx app Url; check end-to-end connectivity
    curl -k https://smoke-<appgw-dns-name>/healthz
    ```

  - ##### SSL Options

    - ###### SSL Offload

      - ###### Offload at the Application Gateway

        ```
        
        ```

        

      - ###### Offload at the Nginx Ingress Congtroller

      - ###### Offload at the Pod

      

    

- #### Deploy MicroServices - DEV

  ![ratings-api-flow2](./Assets/ratings-api-flow2.png)

  ![ratings-web-flow2](./Assets/ratings-web-flow2.png)

  ```bash
  #Deploy more apps - Ratings app
  
  #Deploy backend Mongo DB as container
  kubectl create ns db
  
  helm repo add bitnami https://charts.bitnami.com/bitnami
  helm repo update
  
  helm install ratingsdb bitnami/mongodb -n db \
  --set auth.username=ratingsuser,auth.password=ratingspwd,auth.database=ratingsdb \
  --set controller.nodeSelector.agentpool=$sysPoolName \
  --set controller.defaultBackend.nodeSelector.agentpool=$sysPoolName
  
  #Remove backend Mongo DB container
  #helm uninstall ratingsdb
  
  #RatingsApi - Ratings API backend 
  
  #Clone/Fork/Download Souerce code
  https://github.com/monojit18/mslearn-aks-workshop-ratings-api.git
  
  #CD to the director where Dockerfile exists
  #This docker build but performed in a Cloud Agent(VM) by ACR
  az acr build -t $acrName.azurecr.io/ratings-api:v1.0.0 -r $acrName .
  
  kubectl create secret generic aks-workshop-mongo-secret -n aks-train-dev \
  --from-literal=MONGOCONNECTION="mongodb://ratingsuser:ratingspwd@ratingsdb-mongodb.db:27017/ratingsdb"
  
  #Change <acrName> in the $microservicesFolderPath/Helms/ratingsapi-chart/values-dev.yaml
  #Change <agentpool> in the $microservicesFolderPath/Helms/ratingsapi-chart/values-dev.yaml
  helm install ratingsapi-chart -n aks-train-dev $microservicesFolderPath/Helms/ratingsapi-chart/ -f $microservicesFolderPath/Helms/ratingsapi-chart/values-dev.yaml
  
  #helm upgrade ratingsapi-chart -n aks-train-dev $microservicesFolderPath/Helms/ratingsapi-chart/ -f $microservicesFolderPath/Helms/ratingsapi-chart/values-dev.yaml
  #helm uninstall ratingsapi-chart -n aks-train-dev
  
  #RatingsWeb - Ratings App Frontend
  #Clone/Fork/Download Souerce code
  https://github.com/monojit18/mslearn-aks-workshop-ratings-web.git
  
  #CD to the director where Dockerfile exists
  #This docker build but performed in a Cloud Agent(VM) by ACR
  az acr build -t $acrName.azurecr.io/ratings-web:v1.0.0 -r $acrName .
  
  #Change <acrName> in the $microservicesFolderPath/Helms/ratingsapi-chart/values-dev.yaml
  #Change <agentpool> in the $microservicesFolderPath/Helms/ratingsapi-chart/values-dev.yaml
  helm install ratingsweb-chart -n aks-train-dev $microservicesFolderPath/Helms/ratingsweb-chart/ -f $microservicesFolderPath/Helms/ratingsweb-chart/values-dev.yaml
  
  #helm upgrade ratingsweb-chart -n aks-train-dev $microservicesFolderPath/Helms/ratingsweb-chart/ -f $microservicesFolderPath/Helms/ratingsweb-chart/values-dev.yaml
  #helm uninstall ratingsweb-chart -n aks-train-dev
  ```

  - ##### Ingress - DEV

    ```bash
    #Deploy Ingress Rule object for DEV namespace
    helm create ingress-chart
    
    helm install  ingress-chart -n aks-train-dev $setupFolderPath/Helms/ingress-chart/ -f $setupFolderPath/Helms/ingress-chart/values-dev.yaml
    
    #helm upgrade  ingress-chart -n aks-train-dev $setupFolderPath/Helms/ingress-chart/ -f $setupFolderPath/Helms/ingress-chart/values-dev.yaml
    #helm uninstall ingress-chart -n aks-train-dev
    
    #Call Ratings app Url; check end-to-end connectivity
    curl -k https://dev-<appgw-dns-name>/
    ```

  

- #### Deploy MicroServices - QA

  ```bash
  #Deploy more apps - Ratings app
  
  kubectl create secret generic aks-workshop-mongo-secret -n aks-train-qa --context=$CTX_CLUSTER1 \
  --from-literal=MONGOCONNECTION="mongodb://ratingsuser:ratingspwd@ratingsdb-mongodb.db:27017/ratingsdb"
  
  #Change <acrName> in the $microservicesFolderPath/Helms/ratingsapi-chart/values-qa.yaml
  #Change <agentpool> in the $microservicesFolderPath/Helms/ratingsapi-chart/values-qa.yaml
  helm install ratingsapi-chart -n aks-train-qa $microservicesFolderPath/Helms/ratingsapi-chart/ -f $microservicesFolderPath/Helms/ratingsapi-chart/values-qa.yaml
  
  #helm upgrade ratingsapi-chart -n aks-train-qa $microservicesFolderPath/Helms/ratingsapi-chart/ -f $microservicesFolderPath/Helms/ratingsapi-chart/values-qa.yaml
  #helm uninstall ratingsapi-chart -n aks-train-qa
  
  #RatingsWeb - Ratings App Frontend
  #Change <acrName> in the $microservicesFolderPath/Helms/ratingsapi-chart/values-qa.yaml
  #Change <agentpool> in the $microservicesFolderPath/Helms/ratingsapi-chart/values-qa.yaml
  helm install ratingsweb-chart -n aks-train-qa $microservicesFolderPath/Helms/ratingsweb-chart/ -f $microservicesFolderPath/Helms/ratingsweb-chart/values-qa.yaml
  
  #helm upgrade ratingsweb-chart -n aks-train-qa $microservicesFolderPath/Helms/ratingsweb-chart/ -f $microservicesFolderPath/Helms/ratingsweb-chart/values-qa.yaml
  #helm uninstall ratingsweb-chart -n aks-train-qa
  ```

  - ##### Ingress - QA

    ```bash
    #Deploy Ingress Rule object for QA namespace
    
    helm install  ingress-chart -n aks-train-qa $setupFolderPath/Helms/ingress-chart/ -f $setupFolderPath/Helms/ingress-chart/values-qa.yaml
    
    #helm upgrade  ingress-chart -n aks-train-qa $setupFolderPath/Helms/ingress-chart/ -f $setupFolderPath/Helms/ingress-chart/values-qa.yaml
    #helm uninstall ingress-chart -n aks-train-qa
    
    #Call Ratings app Url; check end-to-end connectivity
    curl -k https://qa-<appgw-dns-name>/
    ```

- #### Resources Sizing

  - Specify Requests for CPU and Memory
  - Specify Limits for CPU and Memory
  - Start Low on Both and then increase gradually through Load Testing
  - Both should depend on the Application running within the Container; and the load that is can handle

  ```yaml
  #Goto $microservicesFolderPath/Helms/ratingsapi-chart/values-dev.yaml
  #Modify values accordingly 
  #Move from Low to High
  #Check the differences
  
  memoryRequest: "64Mi"
  cpuRequest: "100m"
  memoryLimit: "256Mi"
  cpuLimit: "200m"
  ```

- #### Readiness/Liveness

  - Provide Endpoints to check *Readiness* of the Container
  - Provide Endpoints to check *Liveness* of the Container

  ```yaml
  #Goto $microservicesFolderPath/Helms/ratingsapi-chart/values-dev.yaml
  #Modify values accordingly 
  #Move from Low to High
  #Check the differences
  
  readinessPort: 3000
  readinessPath: /healthz
  livenessPort: 3000
  livenessPath: /healthz   
  ```

  

- #### Network Policies

  ![AKS-Components-NP](./Assets/AKS-Components-NP.png)

  

  - ##### Network Policies - Ratings API for DEV

    ```bash
    #East-West Traffic Security
    helm install netpol-ratingsapi-chart -n aks-train-dev $setupFolderPath/Helms/netpol-chart/ -f $setupFolderPath/Helms/netpol-chart/values-ratingsapi-dev.yaml
    
    #helm upgrade netpol-ratingsapi-chart -n aks-train-dev $setupFolderPath/Helms/netpol-chart/ -f $setupFolderPath/Helms/netpol-chart/values-ratingsapi-dev.yaml
    #helm uninstall netpol-ratingsapi-chart -n aks-train-dev
    ```

  - ##### Network Policies - Ratings Web for DEV

    ```bash
    helm install netpol-ratingsweb-chart -n aks-train-dev $setupFolderPath/Helms/netpol-chart/ -f $setupFolderPath/Helms/netpol-chart/values-ratingsweb-dev.yaml
    
    #helm upgrade netpol-ratingsweb-chart -n aks-train-dev $setupFolderPath/Helms/netpol-chart/ -f $setupFolderPath/Helms/netpol-chart/values-ratingsweb-dev.yaml
    #helm uninstall netpol-ratingsweb-chart -n aks-train-dev
    ```
    
  - ##### Network Policies - Test

    ```bash
    #Call Ratings app Url; check end-to-end connectivity
    curl -k https://dev-<appgw-dns-name>/
    
    podName=$(kubectl get pod -l app=nginx-pod -n primary -o jsonpath='{.items[0].metadata.name}')
    #Should FAIL
    kubectl exec -it $podName -n aks-train-smoke -- curl -k http://ratingsapp-web.aks-train-dev.svc/
    
    podName=$(kubectl get pod -l app=ratingsweb-pod -n primary -o jsonpath='{.items[0].metadata.name}')
    #Should SUCCEED
    kubectl exec -it $podName -n aks-train-dev -- curl -k http://ratingsapp-web.aks-train-dev.svc/
    
    #Special Look at the file - $setupFolderPath/Helms/netpol-chart/values-ratingsweb-dev.yaml
    #Allow all Egress
      - {}
    
    #Enable this to make Egress restrictions
    # - destinations:
    #   - podSelector:
    #       matchLabels:
    #         app: ratingsapi-pod
    
    #Enable/Diasble this to see changes in Egress flow
    #   - namespaceSelector:
    #       matchLabels:
    #         name: kube-system
    #     podSelector:
    #       matchLabels:
    #         k8s-app: kube-dns
    
    #Enable this to make Egress restrictions
    #   ports:
    #   - protocol: TCP
    #     port: 3000
    
    #Enable/Diasble this to see changes in Egress flow
    #   - protocol: TCP
    #     port: 53
    #   - protocol: UDP
    #     port: 53
    
    ```

    

- #### Monitoring and Logging

  ![oms-1](./Assets/oms-1.png)

  

  ![metric-server](./Assets/metric-server.png)

  

  - ##### Cluster Health

    ![aks-diag-4](./Assets/aks-diag-4.png)

    

    ![aks-diag-4](./Assets/aks-diag-5.png)

    

    ![aks-diag-4](./Assets/aks-diag-6.png)

    

    ![aks-diag-4](./Assets/aks-diag-7.png)

    

  - ##### Node and Pod Health

    

    ![azmon-2](./Assets/azmon-1.png)

    

    ![azmon-2](./Assets/azmon-2.png)

  - ##### Observe and Analyze Workload Deployments

    - View Metrics from Azure Portal
    
    - View Insights from Azure Portal
    
    - Create a Dashboard in Azure Portal
    
    - Log Analytics with Container Insights
    
    - Select Pre-defined Queries and Check Results
    
    - Create Azure Monitor Workbook and View Results
    
      
    
  - ##### VSCode Extension for Diagonistics

    ![aks-diag-4](./Assets/aks-diag-3.png)

    

    ![aks-diag-4](./Assets/aks-diag-2.png)

    

    ![aks-diag-4](./Assets/aks-diag-1.png)

    

  - ##### Enable Prometheus for AKS

    ```bash
    #Azure Monitor with Prometheus
    https://docs.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-prometheus-integration#configure-and-deploy-configmaps
    
    #Prometheus config map
    https://aka.ms/container-azm-ms-agentconfig
    ```

  - ##### Monitoring with Grafana

    ```bash
    #AKS Monitoring with Grafana
    https://github.com/grafana/helm-charts/blob/main/charts/grafana/README.md
    
    helm repo add grafana https://grafana.github.io/helm-charts
    helm repo update
    
    kubectl create ns grafana-monitor
    helm install aks-train-grafana -n grafana-monitor grafana/grafana --set nodeSelector.agentpool=$sysPoolName
    #helm uninstall aks-train-grafana -n grafana-monitor
    
    #Integrate Grafan with Azure Monitor
    https://grafana.com/grafana/plugins/grafana-azure-monitor-datasource/
    ```
    

- #### Load Testing

  ![jmeter-aks](./Assets/jmeter-aks.jpeg)

  ```bash
  #Load testing with JMeter
  https://techcommunity.microsoft.com/t5/azure-global/scalable-apache-jmeter-test-framework-using-azure-kubernetes/ba-p/1197379
  
  #UNCOMMENT: HPA in .helmignore for RatingsApi app
  #Redeploy RatingsApi app
  #Open JMeter
  ```
  
- #### Cluster Upgrade

  ![cluster-upgrade](./Assets/cluster-upgrade.png)

  - Refer [Here](https://docs.microsoft.com/en-us/azure/aks/upgrade-cluster)

  - ##### Max surge

    - How Many Additional Nodes to add while Upgrade in progress?
      - **Default** = 1
      - **Standard/Optimal** = 33% (of existing no. of nodes in Nodepool)
        - This value can be Integer as well as Percentage

  - ##### During an upgrade

    - Minimum of Max Surge can be 1
    - Maximum of Max Surge can be equal to the number of nodes in your node pool
    - Larger values can be set but the maximum number of nodes used for max surge won't be higher than the number of nodes in the pool at the time of upgrade

  - ##### Steps

    - Add a new buffer node (*or as many nodes as configured in max surge*) to the cluster that runs the specified Kubernetes version
    - *Cordon* and *Drain* one of the old nodes to minimize disruption to running applications (*if you're using max surge it will cordon and drain as many nodes at the same time as the number of buffer nodes specified*).
    - When the old node is fully drained, it will be reimaged to receive the new version and it will become the buffer node for the following node to be upgraded
    - This process repeats until all nodes in the cluster have been upgraded
    - At the end of the process, the last buffer node will be deleted, maintaining the existing agent node count and zone balance

    ```bash
    $upgradeVersion=""
    
    az aks get-upgrades --resource-group $aksResourceGroup --name $clusterName --output table
    az aks upgrade --resource-group $aksResourceGroup --name $clusterName --kubernetes-version $upgradeVersion
    
    #Check if Upgrade is successful
    az aks show --resource-group $aksResourceGroup --name $clusterName --output table
    ```

- #### Node Image Upgrade

  ```bash
  #Check Node details
  kubectl describe nodes <NodeName>
  
  #Update All Nodes in All Nodepools
  az aks upgrade --resource-group $aksResourceGroup --name $clusterName --node-image-only
  
  #Update All Nodes in a specific Nodepool (Not recommened!!)
  $nodepoolToUpgrade=""
  az aks upgrade --resource-group $aksResourceGroup --name $clusterName --node-image-only
  az aks nodepool upgrade --resource-group $aksResourceGroup --name $clusterName --name $nodepoolToUpgrade --node-image-only
  
  #Upgrade with additional Nodes to avoid any downtime
  az aks nodepool upgrade --resource-group $aksResourceGroup --name $clusterName --name $nodepoolToUpgrade \
      --max-surge 33% --node-image-only --no-wait
  ```

- #### Cleanup Resources

  ```bash
  #Cleanup resources - Individual
  
  #az aks delete -g $aksResourceGroup -n $clusterName --yes
  #az acr delete -g $aksResourceGroup -n $acrName --yes
  #az keyvault delete -g $aksResourceGroup -n $keyVaultName --yes
  #az network application-gateway delete -g $aksResourceGroup -n $aksVnetName --yes
  #az network vnet delete -g $aksResourceGroup -n $aksVnetName --yes
  
  #Cleanup resources - All
  
  #az group delete -n $aksResourceGroup --yes
  ```



## References

- [AKS Secure Baseline](https://docs.microsoft.com/en-us/azure/architecture/reference-architectures/containers/aks/secure-baseline-aks)
- [AKS Networking](https://docs.microsoft.com/en-us/azure/aks/concepts-network)
- [Cluster Isloation](https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-cluster-isolation)
- [Resource Management](https://docs.microsoft.com/en-us/azure/aks/developer-best-practices-resource-management)
- [Scheduling](https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-scheduler)
- [Advanced Scheduling](https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-advanced-scheduler)
- [AKS Storage](https://docs.microsoft.com/en-us/azure/aks/concepts-storage)
- [AKS Backups](https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-storage)
- [Scaling AKS Clustrer](https://docs.microsoft.com/en-us/azure/aks/concepts-scale)
- [Security in AKS Cluster](https://docs.microsoft.com/en-us/azure/aks/concepts-security)
- [AKS Monitoring](https://docs.microsoft.com/en-us/azure/aks/monitor-aks)
- [Upgrade AKS Cluster](https://docs.microsoft.com/en-us/azure/aks/upgrade-cluster)
- [Security and Kernel Updates](https://docs.microsoft.com/en-us/azure/aks/node-updates-kured)
- [Patching](https://docs.microsoft.com/en-us/azure/architecture/operator-guides/aks/aks-upgrade-practices)
- [AKS Best Practices](https://docs.microsoft.com/en-us/azure/aks/best-practices?toc=https%3A%2F%2Fdocs.microsoft.com%2Fen-us%2Fazure%2Farchitecture%2Ftoc.json&bc=https%3A%2F%2Fdocs.microsoft.com%2Fen-us%2Fazure%2Farchitecture%2Fbread%2Ftoc.json)



