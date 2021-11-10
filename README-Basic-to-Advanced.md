# AKS HOL - Basic to Advanced

## Introduction

## Purpose

## Understand K8s High Level Architecture

## ![K8s-HLD](./Assets/K8s-HLD.png)



## Understand AKS High Level Architecture

## ![AKS-HLD](./Assets/AKS-HLD.png)



## AKS Baseline architecture

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

- **Local Variables**

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
  version="1.20.7"
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
  apimName=""
  apimSubnetName=""
  apimSubnetPrefix=""
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

- **Login to Azure**

  ```bash
  #Login to Azure
  az login --tenant $tenantId
  
  #Check Selected Subscription
  az account show
  
  #Set appropriate Subscription, if needed
  #az account set -s $subscriptionId
  ```

- **Pre-Config**

  - **Service Principal**

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

  - **Resource Group**

    ```bash
    #Create Resource Group for AKS workloads
    az group create -n $aksResourceGroup -l $location
    ```

  - **Virtual Network**

    - **Azure CNI**

      ![physical-isolation](./Assets/azure-cni.png)

    - **Hub**

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

    - **Spoke**

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

  - **Azure Container Registry**

    ```bash
    #Deploy ACR
    az acr create -n $acrName -g $aksResourceGroup --sku STANDARD --admin-enabled false
    acrId=$(az acr show -n $acrName -g $aksResourceGroup --query="id" -o tsv)
    echo $acrId
    
    #Assign Role to Service Principal for the ACR
    az role assignment create --assignee $spAppId --role "AcrPull" --scope $acrId
    ```

  - **KeyVault**

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

  - **Log Analytics Workspace**

    ```bash
    #Get LogAnalytics Workspace
    logWorkspaceId=$(az monitor log-analytics workspace show -n $logWorkspaceName -g $lwResourceGroup --query="id" -o tsv)
    echo $logWorkspaceId
    
    #Assign Role to Service Principal for the LogAnalytics Workspace
    az role assignment create --assignee $spAppId --role "Contributor" --scope $logWorkspaceId
    ```

    

- **Setup**
  - **Create AKS Cluster**

    - **Isolation**

      - **Physical**

      ​	![physical-isolation](./Assets/physical-isolation.png)

      

      - **Logical**

      ​	![logical-isolation](./Assets/logical-isolation.png)

    

    - **Cluster Creation**

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

    - **Authentication**

      ```bash
      #Connect to AKS cluster and check status
      az aks get-credentials -g $aksResourceGroup --name $clusterName --admin --overwrite
      kubectl get ns
      
      #Connect to AKS cluster as Admin
      az aks get-credentials -g $resourceGroup -n $clusterName --admin
      ```

    - **Nodepool Creation**

      ```bash
      #Create Additional Nodepool - API Nodepool
      az aks nodepool add --cluster-name $clusterName --resource-group $aksResourceGroup \
      --name $apiPoolName --kubernetes-version $version --max-pods $apiPoolMaxPods \
      --node-count $apiPoolNodeCount --node-vm-size $apiPoolNodeSize --os-type $osType \
      --mode User
      ```

    - **AutoScaling**

      ![AKS-Components-AutoScaling](./Assets/AKS-Components-AutoScaling.png)

      

      - **Update System Nodepool**

        ```bash
        az aks nodepool update --cluster-name $clusterName --resource-group $aksResourceGroup \
        --enable-cluster-autoscaler --min-count $sysPoolNodeCount --max-count $sysPoolMaxNodeCount \
        --name $sysPoolName
        ```

      - **Update API Nodepool**

        ```bash
        az aks nodepool update --cluster-name $clusterName --resource-group $aksResourceGroup \
        --enable-cluster-autoscaler --min-count $apiPoolNodeCount --max-count $apiPoolMaxNodeCount \
        --name $apiPoolName
        ```

- **Post-Config**

  ![aks-short-view](./Assets/appgw-internals.png)

  

  ![aks-short-view](./Assets/aks-short-view.png)

  - **Secure AKS cluster**

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

  - **Create Namespaces**

    ```bash
    #Create Namespaces
    #DEV workloads
    kubectl create ns aks-train-dev
    
    #QA workloads
    kubectl create ns aks-train-qa
    
    #Smoke Test
    kubectl create ns aks-train-smoke
    ```

  - **Deploy Application Gateway**

    ![appgw-overview](./Assets/appgw-overview.png)

    

  - **RBAC**

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

    

  - **Ingress - Smoke**

    ```bash
    #Deploy Ingress Rule object for Smoke namespace
    helm create ingress-chart
    
    helm install ingress-chart -n aks-train-smoke $setupFolderPath/Helms/ingress-chart/ -f $setupFolderPath/Helms/ingress-chart/values-smoke.yaml
    
    #helm upgrade  ingress-chart -n aks-train-smoke $setupFolderPath/Helms/ingress-chart/ -f $setupFolderPath/Helms/ingress-chart/values-smoke.yaml
    #helm uninstall ingress-chart -n aks-train-smoke
    ```

  - **TEST - Smoke**

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

- **Deploy MicroServices - DEV**

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

  - **Ingress - DEV**

    ```bash
    #Deploy Ingress Rule object for DEV namespace
    helm create ingress-chart
    
    helm install  ingress-chart -n aks-train-dev $setupFolderPath/Helms/ingress-chart/ -f $setupFolderPath/Helms/ingress-chart/values-dev.yaml
    
    #helm upgrade  ingress-chart -n aks-train-dev $setupFolderPath/Helms/ingress-chart/ -f $setupFolderPath/Helms/ingress-chart/values-dev.yaml
    #helm uninstall ingress-chart -n aks-train-dev
    
    #Call Ratings app Url; check end-to-end connectivity
    curl -k https://dev-<appgw-dns-name>/
    ```

  

- **Deploy MicroServices - QA**

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

  - **Ingress - QA**

    ```bash
    #Deploy Ingress Rule object for QA namespace
    
    helm install  ingress-chart -n aks-train-qa $setupFolderPath/Helms/ingress-chart/ -f $setupFolderPath/Helms/ingress-chart/values-qa.yaml
    
    #helm upgrade  ingress-chart -n aks-train-qa $setupFolderPath/Helms/ingress-chart/ -f $setupFolderPath/Helms/ingress-chart/values-qa.yaml
    #helm uninstall ingress-chart -n aks-train-qa
    
    #Call Ratings app Url; check end-to-end connectivity
    curl -k https://qa-<appgw-dns-name>/
    ```

- **Network Policies**

  ![AKS-Components-NP](./Assets/AKS-Components-NP.png)

  - **Network Policies - DEV**

    ```bash
    #East-West Traffic Security
    helm install netpol-chart -n aks-train-dev $setupFolderPath/Helms/netpol-chart/ -f $setupFolderPath/Helms/netpol-chart/values-dev.yaml
    
    #helm upgrade netpol-chart -n aks-train-dev $setupFolderPath/Helms/netpol-chart/ -f $setupFolderPath/Helms/netpol-chart/values-dev.yaml
    #helm uninstall netpol-chart -n aks-train-dev
    ```

  - **Network Policies - QA**

    ```bash
    helm install netpol-chart -n aks-train-qa $setupFolderPath/Helms/netpol-chart/ -f $setupFolderPath/Helms/netpol-chart/values-qa.yaml
    
    #helm upgrade netpol-chart -n aks-train-qa $setupFolderPath/Helms/netpol-chart/ -f $setupFolderPath/Helms/netpol-chart/values-qa.yaml
    #helm uninstall netpol-chart -n aks-train-qa
    ```

  - **Network Policies - Smoke**

    ```bash
    helm install netpol-chart -n aks-train-smoke $setupFolderPath/Helms/netpol-chart/ -f $setupFolderPath/Helms/netpol-chart/values-smoke.yaml
    
    #helm upgrade netpol-chart -n aks-train-smoke $setupFolderPath/Helms/netpol-chart/ -f $setupFolderPath/Helms/netpol-chart/values-smoke.yaml
    #helm uninstall netpol-chart -n aks-train-smoke
    
    #Call Ratings app Url; check end-to-end connectivity
    curl -k https://dev-<appgw-dns-name>/
    curl -k https://qa-<appgw-dns-name>/
    curl -k https://smoke-<appgw-dns-name>/nginx
    
    podName=$(kubectl get pod -l app=nginx-pod -n primary -o jsonpath='{.items[0].metadata.name}')
    
    #Should succeed
    kubectl exec -it $podName -n aks-train-smoke -- curl -k http://ratingsapp-web.aks-train-dev.svc/
    
    #Should succeed
    kubectl exec -it $podName -n aks-train-smoke -- curl -k http://ratingsapp-web.aks-train-qa.svc/
    
    podName=$(kubectl get pod -l app=ratingsweb-pod -n primary -o jsonpath='{.items[0].metadata.name}')
    
    #Should FAIL
    kubectl exec -it $podName -n aks-train-dev -- curl -k http://ratingsapp-web.aks-train-qa.svc/
    
    #Should FAIL
    kubectl exec -it $podName -n aks-train-dev -- curl -k http://nginx-svc.aks-train-smoke.svc/
    ```

- **Monitoring and Logging**

  - **Cluster Health**

  - **Node and Pod Health**

  - **Observe and Analyze Workload Deployments**

    - View Metrics from Azure Portal

    - View Insights from Azure Portal

    - Create a Dashboard in Azure Portal

    - Log Analytics with Container Insights

    - Select Pre-defined Queries and Check Results

    - Create Azure Monitor Workbook and View Results

      [Multiple Screenshots - TBD]

  - **Enable Prometheus for AKS**

    ```bash
    #Azure Monitor with Prometheus
    https://docs.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-prometheus-integration#configure-and-deploy-configmaps
    
    #Prometheus config map
    https://aka.ms/container-azm-ms-agentconfig
    ```

  - **Monitoring with Grafana**

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

    

- **Load Testing**

  ![jmeter-aks](./Assets/jmeter-aks.jpeg)

  ```bash
  #Load testing with JMeter
  https://techcommunity.microsoft.com/t5/azure-global/scalable-apache-jmeter-test-framework-using-azure-kubernetes/ba-p/1197379
  
  
  #UNCOMMENT: HPA in .helmignore for RatingsApi app
  #Redeploy RatingsApi app
  #Open JMeter
  ```

- **Cluster Upgrade**

  - Refer [Here](https://docs.microsoft.com/en-us/azure/aks/upgrade-cluster)

  - **Max surge**

    - How Many Additional Nodes to add while Upgrade in progress?
      - **Default** = 1
      - **Standard/Optimal** = 33% (of existing no. of nodes in Nodepool)
        - This value can be Integer as well as Percentage

  - **During an upgrade**

    - Minimum of Max Surge can be 1
    - Maximum of Max Surge can be equal to the number of nodes in your node pool
    - Larger values can be set but the maximum number of nodes used for max surge won't be higher than the number of nodes in the pool at the time of upgrade

  - **Steps**

    - Add a new buffer node (or as many nodes as configured in max surge) to the cluster that runs the specified Kubernetes version
    - Cordon and drain one of the old nodes to minimize disruption to running applications (if you're using max surge it will cordon and drain as many nodes at the same time as the number of buffer nodes specified).
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

- **Node Image Upgrade**

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

- **Cleanup resources**

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

[TBD]

